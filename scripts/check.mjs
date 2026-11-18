#!/usr/bin/env node
// Validates the repository: skill frontmatter, role files, plugin.json agents, relative links,
// `Section → Field` config references and the README version badge. Zero dependencies.
// Usage: node scripts/check.mjs [root]   (exit 1 when any rule fails)

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_DESCRIPTION = 1024;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'scratch', '.claude']);

const read = (path) => readFileSync(path, 'utf8');
const rel = (root, path) => relative(root, path).split(sep).join('/');

/** Every markdown file under `dir`, skipping git, dependencies and scratch folders. */
export function markdownFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out.sort();
}

/** Line number (1-based) of a character offset. */
function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** Replaces fenced code blocks (and, when asked, inline code) with spaces, keeping offsets and newlines. */
export function blankCode(text, { inline = false } = {}) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const lines = text.split('\n');
  let fence = null;
  const out = lines.map((line) => {
    const m = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
      return blank(line);
    }
    if (m) {
      fence = m[1];
      return blank(line);
    }
    return line;
  });
  let result = out.join('\n');
  if (inline) result = result.replace(/(`+)[^`]*?\1/g, blank);
  return result;
}

/**
 * Parses YAML frontmatter just enough for these rules: top-level keys and plain, quoted or
 * block-scalar string values. Returns null when the file has no frontmatter.
 */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return null;
  const fields = {};
  let key = null;
  let block = false;
  for (const line of m[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z_][\w-]*):(?:\s+(.*))?$/);
    if (top) {
      key = top[1];
      const value = (top[2] ?? '').trim();
      block = /^[|>][+-]?$/.test(value);
      fields[key] = block ? '' : value.replace(/^(['"])([\s\S]*)\1$/, '$2');
    } else if (key && block && /^\s/.test(line)) {
      fields[key] += (fields[key] ? ' ' : '') + line.trim();
    }
  }
  return fields;
}

/** Rule: every skills/<folder>/SKILL.md has frontmatter of exactly name + description. */
export function checkSkills(root) {
  const errors = [];
  const skillsDir = join(root, 'skills');
  if (!existsSync(skillsDir)) return errors;
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(skillsDir, entry.name, 'SKILL.md');
    const where = rel(root, path);
    if (!existsSync(path)) {
      errors.push(`${where}: missing (every folder in skills/ is a skill)`);
      continue;
    }
    const fm = parseFrontmatter(read(path));
    if (!fm) {
      errors.push(`${where}: no frontmatter`);
      continue;
    }
    const keys = Object.keys(fm).sort();
    if (keys.join(',') !== 'description,name') {
      errors.push(`${where}: frontmatter must be exactly name and description, found: ${keys.join(', ') || 'nothing'}`);
    }
    if (fm.name !== undefined && fm.name !== entry.name) {
      errors.push(`${where}: name "${fm.name}" differs from its folder "${entry.name}"`);
    }
    if (!fm.description) errors.push(`${where}: empty description`);
    else if (fm.description.length > MAX_DESCRIPTION) {
      errors.push(`${where}: description is ${fm.description.length} characters (max ${MAX_DESCRIPTION})`);
    }
  }
  return errors;
}

/** Rule: role files have name + description, and every plugin.json agents path exists. */
export function checkAgents(root) {
  const errors = [];
  const agentsDir = join(root, 'skills', 'domino-agents', 'agents');
  if (existsSync(agentsDir)) {
    for (const file of readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort()) {
      const path = join(agentsDir, file);
      const fm = parseFrontmatter(read(path));
      const where = rel(root, path);
      if (!fm) errors.push(`${where}: no frontmatter`);
      else {
        if (!fm.name) errors.push(`${where}: frontmatter has no name`);
        if (!fm.description) errors.push(`${where}: frontmatter has no description`);
      }
    }
  }
  const pluginPath = join(root, '.claude-plugin', 'plugin.json');
  if (existsSync(pluginPath)) {
    const plugin = JSON.parse(read(pluginPath));
    for (const agent of [].concat(plugin.agents ?? [])) {
      if (!existsSync(resolve(root, agent))) {
        errors.push(`.claude-plugin/plugin.json: agents path ${agent} does not exist`);
      }
    }
  }
  return errors;
}

/** Rule: every relative markdown link (and HTML href/src) in the repo resolves to a file. */
export function checkLinks(root) {
  const errors = [];
  for (const path of markdownFiles(root)) {
    const text = blankCode(read(path), { inline: true });
    const targets = [];
    for (const m of text.matchAll(/!?\[[^\]\n]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g)) {
      targets.push([m[1], m.index]);
    }
    for (const m of text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) targets.push([m[1], m.index]);
    for (const m of text.matchAll(/^\s{0,3}\[[^\]]+\]:\s+<?(\S+?)>?(?:\s|$)/gm)) targets.push([m[1], m.index]);
    for (const [target, index] of targets) {
      if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) continue;
      const file = decodeURIComponent(target.split(/[#?]/)[0]);
      if (!file) continue;
      const resolved = file.startsWith('/') ? join(root, file) : resolve(dirname(path), file);
      if (!existsSync(resolved)) {
        errors.push(`${rel(root, path)}:${lineOf(text, index)}: link ${target} does not resolve`);
      }
    }
  }
  return errors;
}

/**
 * Reads config-template.md: each `## Section` and its fields (`- Field:` lines, plus `key:` lines
 * inside the section's fenced blocks, which is how Memory guard keeps its numbers).
 */
export function parseConfigTemplate(text) {
  const sections = new Map();
  let current = null;
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    const heading = !inFence && line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1];
      sections.set(current, new Set());
      continue;
    }
    if (!current) continue;
    const field = inFence ? line.match(/^([A-Za-z_][\w-]*):/) : line.match(/^-\s+([^:]+?):/);
    if (field) sections.get(current).add(field[1]);
  }
  return sections;
}

/** Rule: every `Section → Field` reference names a field that config-template.md has. */
export function checkConfigRefs(root) {
  const errors = [];
  const templatePath = join(root, 'skills', 'domino-agents', 'config-template.md');
  if (!existsSync(templatePath)) return errors;
  const sections = parseConfigTemplate(read(templatePath));
  const files = [...markdownFiles(join(root, 'skills')), join(root, 'AGENTS.md'), join(root, 'README.md')]
    .filter((f) => existsSync(f));
  // A capitalised phrase of up to four words, an arrow, then a word. File references
  // (`SKILL.md → *Heading*`) and prose (`idea → design`) never match.
  const ref = /(?<![\w.*`])([A-Z][a-z]+(?:\s+[a-z]+){0,3})\s+→\s+(?=\w)/g;
  for (const path of files) {
    const text = blankCode(read(path)).replace(/<!--[\s\S]*?-->/g, (s) => s.replace(/[^\n]/g, ' '));
    for (const m of text.matchAll(ref)) {
      const words = m[1].split(/\s+/);
      // The longest trailing run of words that names a section: "Run Release → …" is Release.
      let section = null;
      for (let i = 0; i < words.length && !section; i++) {
        const candidate = words.slice(i).join(' ');
        if (sections.has(candidate)) section = candidate;
      }
      const after = text.slice(m.index + m[0].length, m.index + m[0].length + 80).replace(/\s+/g, ' ').trimEnd();
      const where = `${rel(root, path)}:${lineOf(text, m.index)}`;
      if (!section) {
        if (words.length === 1 && /^[A-Z]/.test(after)) errors.push(`${where}: "${m[1]} → ${after.split(' ').slice(0, 3).join(' ')}" names no config section`);
        continue;
      }
      const fields = [...sections.get(section)].sort((a, b) => b.length - a.length);
      const hit = fields.find((f) => after.startsWith(f) && !/^[\w-]/.test(after.slice(f.length)));
      if (!hit) {
        const shown = after.split(' ').slice(0, 4).join(' ');
        errors.push(`${where}: "${section} → ${shown}…" is not a field under "## ${section}" in config-template.md`);
      }
    }
  }
  return errors;
}

/** Rule: plugin.json version equals the README version badge. */
export function checkVersion(root) {
  const pluginPath = join(root, '.claude-plugin', 'plugin.json');
  const readmePath = join(root, 'README.md');
  if (!existsSync(pluginPath) || !existsSync(readmePath)) return [];
  const { version } = JSON.parse(read(pluginPath));
  if (!version) return ['.claude-plugin/plugin.json: no version'];
  // shields.io escapes a dash in a badge as "--": 0.2.0-rc.1 is written 0.2.0--rc.1.
  const badge = read(readmePath).match(/img\.shields\.io\/badge\/version-((?:[^-\s"]|--)+)-/);
  if (!badge) return ['README.md: no version badge (img.shields.io/badge/version-X.Y.Z-…)'];
  const shown = badge[1].replace(/--/g, '-');
  return shown === version ? [] : [`README.md: version badge says ${shown}, plugin.json says ${version}`];
}

export const RULES = {
  skills: checkSkills,
  agents: checkAgents,
  links: checkLinks,
  'config references': checkConfigRefs,
  version: checkVersion,
};

export function checkAll(root) {
  return Object.entries(RULES).flatMap(([rule, fn]) => fn(root).map((e) => `[${rule}] ${e}`));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
  if (!statSync(root).isDirectory()) throw new Error(`${root} is not a directory`);
  const errors = checkAll(root);
  for (const e of errors) console.error(e);
  console.log(errors.length ? `\n${errors.length} problem(s) found.` : 'All checks passed.');
  process.exit(errors.length ? 1 : 0);
}
