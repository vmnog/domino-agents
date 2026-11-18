# Releasing domino-agents

A release is a version bump, a tag and hand-written notes. Nothing is automated: CI only checks
that the repository is consistent (`npm run check`, `npm test`).

## Where the version lives

- **`.claude-plugin/plugin.json` → `version`** is the only source. Claude Code compares it to decide
  whether an installed plugin has an update, so every tag needs its own version there.
- **The README version badge** repeats it. `npm run check` fails when the two differ. shields.io
  writes a dash as two dashes, so `0.2.0-rc.1` is `version-0.2.0--rc.1` in the badge URL.
- `marketplace.json` has no version. Keep it that way, so there is one number to bump.

Versions follow [semver](https://semver.org). While the major is 0, a minor bump (0.1 → 0.2) may
break: it is how a removed or renamed skill, command, config field or role file ships.

## Cut a release

1. **Everything for it is merged into `main`**, and CI is green there.
2. **Bump** `plugin.json` and the README badge on a branch. The commit, and the pull request when
   `main` takes changes only through one, are named after the version and nothing else: `v0.2.0`.

   ```bash
   git switch -c release/v0.2.0 origin/main
   ```

   ```bash
   npm run check && npm test
   ```

   ```bash
   git commit -am "v0.2.0"
   ```

3. **Merge it**, then tag the merged commit on `main` with an annotated `vX.Y.Z` tag and push the tag:

   ```bash
   git switch main && git pull --ff-only
   ```

   ```bash
   git tag -a v0.2.0 -m "v0.2.0"
   ```

   ```bash
   git push origin v0.2.0
   ```

4. **Write the release notes by hand** (template below) and publish them on the tag:

   ```bash
   gh release create v0.2.0 --verify-tag --title "v0.2.0" --notes-file notes.md
   ```

5. **Check an install from scratch** in a throwaway folder: `/plugin marketplace add
   vmnog/domino-agents`, `/plugin install domino-agents@domino-agents`, and the command
   `/domino-agents:domino-agents` appears.

## Release notes

Every release says what changed for a person who already uses it, and how to get it:

- **What changed**: short bullets, user-facing first. Link the pull requests.
- **Breaking**: anything renamed or removed (a skill, a command, a config field, a role file, a
  file another file links to). Each gets **migration steps**: what to run or edit, in order.
- **Config**: every field added to `config-template.md`, with the line to add to an existing
  `docs/agents/domino-agents.md`. An update never edits a project's config.
- **Update:** one line per channel:

  ```markdown
  **Update:**
  - Claude Code (terminal): `claude plugin marketplace update domino-agents`, then `claude plugin update domino-agents@domino-agents`, then restart Claude Code.
  - Claude Code (chat box): `/plugin`, then Marketplaces, `domino-agents`, Update; then restart.
  - Claude Desktop or claude.ai: Customize, then Plugins: update the `vmnog/domino-agents` marketplace, then the plugin.
  - skills CLI: `npx skills update`.
  - Copied files: `git -C ~/src/domino-agents pull`, then copy `skills/` and `agents/` again.
  ```

## Release candidates

Cut one before a breaking release, or whenever a change needs testing in real projects first.

1. On the branch to test (a pull request's branch works), set the version to `X.Y.Z-rc.N` in
   `plugin.json` and the badge (`X.Y.Z--rc.N`), and commit it as `vX.Y.Z-rc.N`.
2. Tag that commit and push the tag:

   ```bash
   git tag -a v0.2.0-rc.1 -m "v0.2.0-rc.1"
   ```

   ```bash
   git push origin v0.2.0-rc.1
   ```

3. Publish it as a pre-release, so it never shows as the latest:

   ```bash
   gh release create v0.2.0-rc.1 --verify-tag --prerelease --title "v0.2.0-rc.1" --notes-file notes.md
   ```

4. Testers install it by its tag. A plugin install that already has the `domino-agents`
   marketplace removes it first (`/plugin marketplace remove domino-agents`), and adds it back
   without the tag after testing.

   ```text
   /plugin marketplace add vmnog/domino-agents#v0.2.0-rc.1
   /plugin install domino-agents@domino-agents
   ```

   ```bash
   npx skills add "vmnog/domino-agents#v0.2.0-rc.1"
   ```

5. Each fix makes the next candidate (`rc.2`). The final release bumps to `X.Y.Z` on `main` as
   above; never move or reuse a tag.

## Draft: v0.2.0 notes

For after [vmnog/domino-agents#3](https://github.com/vmnog/domino-agents/pull/3) merges. Check
each line against what actually merged before publishing.

````markdown
## v0.2.0

The MVP check is now part of the Coordinator loop instead of a separate skill, and a project with
screens sets its design foundations once, before any exploration.

### What changed

- **The MVP check moved into domino-agents.** `skills/mvp-challenge/` is gone; its rules are now
  `skills/domino-agents/MVP.md`, and its devil's-advocate prompt is `skills/domino-agents/ADVOCATE.md`.
  The `domino-agents` skill now triggers on what `mvp-challenge` used to: "should we build X", and
  picking, adding, dropping or reordering a ticket. (#3)
- **Design foundations come first.** A project with screens and no design brief or design system
  gets a *Design foundations* ticket, first in the current milestone, and every ticket that changes
  what people see is blocked by it. A design system already in code is drawn as it is, never
  invented again. Later explorations reuse the foundations. See `FOUNDATIONS.md`. (#3)
- Release tooling: `npm run check`, `npm test`, CI on pull requests, and update instructions in the
  README. (#4)

### Breaking

**`mvp-challenge` no longer exists.** If you called it directly:

1. Update the plugin (below). The old skill disappears with the update.
2. Instead of `/domino-agents:mvp-challenge` (plugin) or `/mvp-challenge` (skills CLI or copied
   files), ask the Coordinator, for example "should we build X?" or "MVP-check ABC-12". The
   Coordinator runs the same check from `MVP.md`.
3. Skills CLI: run `npx skills remove mvp-challenge` if `npx skills update` leaves it installed.
4. Copied files: delete `.claude/skills/mvp-challenge/` (or `~/.claude/skills/mvp-challenge/`).
5. Search your own `CLAUDE.md`, `AGENTS.md` and notes for `mvp-challenge` and point them at the
   domino-agents Coordinator instead.

### Config

Three fields are new under `## Design` in `config-template.md`. Add them to your
`docs/agents/domino-agents.md`, after `Board names:`, or ask the Coordinator to add them:

```markdown
- Brief: <the design brief file, e.g. DESIGN.md, or none for a project with no screens>
- Brand assets: <the folder with logo variants, fonts and app icons, or none>
- Icon set: <the one icon library every board and screen uses, or none>
```

`Tokens file` may now also say `set by <foundations ticket id>`.

**Update:**
- Claude Code (terminal): `claude plugin marketplace update domino-agents`, then `claude plugin update domino-agents@domino-agents`, then restart Claude Code.
- Claude Code (chat box): `/plugin`, then Marketplaces, `domino-agents`, Update; then restart.
- Claude Desktop or claude.ai: Customize, then Plugins: update the `vmnog/domino-agents` marketplace, then the plugin.
- skills CLI: `npx skills update`, then `npx skills remove mvp-challenge` if it is still listed.
- Copied files: `git -C ~/src/domino-agents pull`, copy `skills/` and `agents/` again, and delete the old `mvp-challenge` folder.
````
