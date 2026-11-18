import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  checkAgents,
  checkAll,
  checkConfigRefs,
  checkLinks,
  checkSkills,
  checkVersion,
  parseFrontmatter,
} from '../scripts/check.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const TEMPLATE = `# config

## Gate

- Check: <fill>
- Lint: <fill>

## Keys and limits

- Off limits: <fill>

## Memory guard

\`\`\`text
limit_percent: 90
\`\`\`
`;

/** A minimal valid repository; `files` overrides or adds paths. */
function fixture(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'domino-check-'));
  const base = {
    '.claude-plugin/plugin.json': JSON.stringify({
      name: 'x',
      version: '1.2.3',
      agents: ['./skills/domino-agents/agents/domino-builder.md'],
    }),
    'README.md': '<img src="https://img.shields.io/badge/version-1.2.3-111" alt="v">\n',
    'skills/domino-agents/SKILL.md': '---\nname: domino-agents\ndescription: Runs the loop.\n---\n\n# x\n',
    'skills/domino-agents/agents/domino-builder.md': '---\nname: domino-builder\ndescription: Builds.\nmodel: inherit\n---\n',
    'skills/domino-agents/config-template.md': TEMPLATE,
  };
  for (const [path, content] of Object.entries({ ...base, ...files })) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

describe('the real repository', () => {
  it('passes every rule', () => {
    assert.deepEqual(checkAll(ROOT), []);
  });

  it('has no carriage return in any hook file (the memory guard runs under bash)', () => {
    for (const skill of readdirSync(join(ROOT, 'skills'))) {
      const hooks = join(ROOT, 'skills', skill, 'hooks');
      let files = [];
      try {
        files = readdirSync(hooks);
      } catch {
        continue;
      }
      for (const file of files) {
        assert.ok(!readFileSync(join(hooks, file), 'utf8').includes('\r'), `${skill}/hooks/${file} has \\r`);
      }
    }
  });
});

describe('the fixture', () => {
  it('passes, so each test below fails for its own reason only', () => {
    assert.deepEqual(checkAll(fixture()), []);
  });
});

describe('skills', () => {
  it('fails without frontmatter', () => {
    const errors = checkSkills(fixture({ 'skills/domino-agents/SKILL.md': '# no frontmatter\n' }));
    assert.match(errors.join(), /no frontmatter/);
  });

  it('fails on a key other than name and description', () => {
    const errors = checkSkills(
      fixture({ 'skills/domino-agents/SKILL.md': '---\nname: domino-agents\ndescription: d\nmodel: x\n---\n' }),
    );
    assert.match(errors.join(), /exactly name and description/);
  });

  it('fails when description is missing', () => {
    const errors = checkSkills(fixture({ 'skills/domino-agents/SKILL.md': '---\nname: domino-agents\n---\n' }));
    assert.match(errors.join(), /exactly name and description/);
  });

  it('fails on a name that differs from its folder', () => {
    const errors = checkSkills(
      fixture({ 'skills/domino-agents/SKILL.md': '---\nname: domino\ndescription: d\n---\n' }),
    );
    assert.match(errors.join(), /differs from its folder/);
  });

  it('fails on a description over 1024 characters', () => {
    const long = 'a'.repeat(1025);
    const errors = checkSkills(
      fixture({ 'skills/domino-agents/SKILL.md': `---\nname: domino-agents\ndescription: ${long}\n---\n` }),
    );
    assert.match(errors.join(), /1025 characters/);
  });

  it('accepts a description of exactly 1024 characters', () => {
    const errors = checkSkills(
      fixture({ 'skills/domino-agents/SKILL.md': `---\nname: domino-agents\ndescription: ${'a'.repeat(1024)}\n---\n` }),
    );
    assert.deepEqual(errors, []);
  });

  it('fails on a skill folder without SKILL.md', () => {
    const errors = checkSkills(fixture({ 'skills/empty/README.md': 'x' }));
    assert.match(errors.join(), /skills\/empty\/SKILL.md: missing/);
  });
});

describe('frontmatter parser', () => {
  it('reads quoted and block-scalar values', () => {
    assert.equal(parseFrontmatter('---\nname: "a b"\n---\n').name, 'a b');
    assert.equal(parseFrontmatter('---\ndescription: >\n  one\n  two\n---\n').description, 'one two');
  });
});

describe('agents', () => {
  it('fails on a role file without description', () => {
    const errors = checkAgents(
      fixture({ 'skills/domino-agents/agents/domino-builder.md': '---\nname: domino-builder\n---\n' }),
    );
    assert.match(errors.join(), /no description/);
  });

  it('fails on a role file without name', () => {
    const errors = checkAgents(
      fixture({ 'skills/domino-agents/agents/domino-designer.md': '---\ndescription: d\n---\n' }),
    );
    assert.match(errors.join(), /domino-designer.md: frontmatter has no name/);
  });

  it('fails on a plugin.json agents path that does not exist', () => {
    const errors = checkAgents(
      fixture({
        '.claude-plugin/plugin.json': JSON.stringify({ version: '1.2.3', agents: ['./skills/gone.md'] }),
      }),
    );
    assert.match(errors.join(), /\.\/skills\/gone\.md does not exist/);
  });
});

describe('links', () => {
  it('fails on a relative link that does not resolve', () => {
    const errors = checkLinks(fixture({ 'skills/domino-agents/GRILL.md': 'See [setup](SETUP.md).\n' }));
    assert.match(errors.join(), /GRILL.md:1: link SETUP.md does not resolve/);
  });

  it('resolves links relative to their file, with anchors', () => {
    const errors = checkLinks(
      fixture({ 'AGENTS.md': '[skill](skills/domino-agents/SKILL.md#the-config) [top](#top)\n' }),
    );
    assert.deepEqual(errors, []);
  });

  it('fails on an HTML src or href that does not resolve', () => {
    const errors = checkLinks(fixture({ 'README.md': '<a href="LICENSE">x</a>\n' }));
    assert.match(errors.join(), /link LICENSE does not resolve/);
  });

  it('skips code fences, inline code and http links', () => {
    const errors = checkLinks(
      fixture({
        'AGENTS.md': '```md\n[a](missing.md)\n```\n`[b](missing.md)` [c](https://example.com/missing.md)\n',
      }),
    );
    assert.deepEqual(errors, []);
  });
});

describe('config references', () => {
  it('accepts a field the template has, including one followed by prose', () => {
    const errors = checkConfigRefs(
      fixture({ 'skills/domino-agents/RELEASE.md': 'Run Gate → Check green, and Gate → Lint leaves nothing.\n' }),
    );
    assert.deepEqual(errors, []);
  });

  it('fails on a field the template lacks', () => {
    const errors = checkConfigRefs(fixture({ 'skills/domino-agents/DESIGN.md': 'Read Gate → Brief first.\n' }));
    assert.match(errors.join(), /DESIGN.md:1: "Gate → Brief first\.…" is not a field under "## Gate"/);
  });

  it('fails on a field that only starts like a real one', () => {
    const errors = checkConfigRefs(fixture({ 'skills/domino-agents/DESIGN.md': 'Gate → Checks pass.\n' }));
    assert.equal(errors.length, 1);
  });

  it('fails on a section the template lacks', () => {
    const errors = checkConfigRefs(fixture({ 'skills/domino-agents/DESIGN.md': 'Read Deploy → Target.\n' }));
    assert.match(errors.join(), /"Deploy → Target\." names no config section/);
  });

  it('follows a reference across a line break and multi-word sections', () => {
    const errors = checkConfigRefs(
      fixture({ 'skills/domino-agents/agents/domino-builder.md': '---\nname: b\ndescription: d\n---\nKeys and\nlimits → Off\nlimits stay.\n' }),
    );
    assert.deepEqual(errors, []);
  });

  it('reads Memory guard keys from its fenced block', () => {
    const ok = checkConfigRefs(fixture({ 'skills/domino-agents/SKILL.md': '---\nname: domino-agents\ndescription: d\n---\nMemory guard → limit_percent.\n' }));
    const bad = checkConfigRefs(fixture({ 'skills/domino-agents/SKILL.md': '---\nname: domino-agents\ndescription: d\n---\nMemory guard → limit_gb.\n' }));
    assert.deepEqual(ok, []);
    assert.equal(bad.length, 1);
  });

  it('ignores file references, prose arrows and code fences', () => {
    const errors = checkConfigRefs(
      fixture({
        'skills/domino-agents/STATUS.md':
          'See SKILL.md → *The frontier* and RUNTIMES.md → *No code host*.\nidea → MVP check → grill.\n```\nGate → Nope\n```\n',
      }),
    );
    assert.deepEqual(errors, []);
  });
});

describe('version', () => {
  it('fails when the README badge differs from plugin.json', () => {
    const errors = checkVersion(
      fixture({ 'README.md': '<img src="https://img.shields.io/badge/version-1.2.2-111">\n' }),
    );
    assert.match(errors.join(), /badge says 1\.2\.2, plugin\.json says 1\.2\.3/);
  });

  it('fails when the README has no version badge', () => {
    assert.match(checkVersion(fixture({ 'README.md': '# readme\n' })).join(), /no version badge/);
  });

  it('reads a pre-release badge, where shields.io writes a dash as two', () => {
    const errors = checkVersion(
      fixture({
        '.claude-plugin/plugin.json': JSON.stringify({ version: '0.2.0-rc.1', agents: [] }),
        'README.md': '<img src="https://img.shields.io/badge/version-0.2.0--rc.1-111">\n',
      }),
    );
    assert.deepEqual(errors, []);
  });
});
