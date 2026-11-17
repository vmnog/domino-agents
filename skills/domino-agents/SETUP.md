# First run: the setup

Runs when `docs/agents/domino-agents.md` is missing or still holds a `<fill: …>`. It looks at the
project, checks the prerequisites, asks the approver what only they can decide, and writes the
config from [config-template.md](config-template.md). Nothing else in the loop runs until it is
done.

## 1. Look first

Read what exists; ask only what looking cannot answer.

- `git remote -v`, `git branch -a`, `git log -1`: the code host (none when there is no remote),
  whether an integration branch (`staging`, `develop`) already exists beside the production one,
  and whether there is a commit yet.
- The scripts a gate would run: `package.json`, `Makefile`, `pyproject.toml`, `justfile`, the CI
  workflows in `.github/workflows/`.
- `CLAUDE.md`, `AGENTS.md`, a glossary (`CONTEXT.md`, `GLOSSARY.md`), a decisions folder
  (`docs/decisions/`, `docs/adr/`).
- `docs/agents/issue-tracker.md`: the mattpocock-skills setup's answer for the tracker.
- This session's tools and skills: `start_session` present means the runtime is `claude-desktop`;
  the `mattpocock-skills` skills and the design skills (`better-ui`); a tracker MCP (Linear, Jira); a design MCP
  (Paper, Figma, Pencil); `gh auth status`.
- The operating system, for the memory guard (macOS and Linux are supported).

## 2. Check the prerequisites

Show the approver one table: each prerequisite, present or missing, and what is lost without it.

| Prerequisite | Needed for | When it is missing |
|---|---|---|
| `mattpocock-skills` installed, and `/mattpocock-skills:setup-matt-pocock-skills` run (`docs/agents/issue-tracker.md` exists) | The tracker answer, `grilling`, `tdd`, `codebase-design`, `code-review`, `to-tickets` | **Stop here.** Give the approver the two commands, `/plugin install mattpocock-skills@claude-plugins-official` and `/mattpocock-skills:setup-matt-pocock-skills`, and run the setup again after. Every later step reads the tracker answer. |
| The design skills installed (`better-ui` at least), from four public sets: `npx skills add jakubkrehel/skills`, `emilkowalski/skills`, `Jakubantalik/transitions.dev`, `AgentsORG/design-engineering` | Designers and builders on anything a person sees | A project with a UI goes on only with the approver's yes: designers then work from the project's own rules alone. A project with no UI skips it. |
| A tracker that answers one read call (list the milestones) | Every step | Stop and fix the connection. |
| `gh` (or `glab`) logged in, when the repository has a remote | PRs, the duplicate-work check | Stop and ask the approver to log in. With no remote, round S asks about the code host instead. |
| A design tool's MCP | The design gate's boards | Design → Tool is none: boards are code variants and screenshots (DESIGN.md). |

## 3. Ask

At most three rounds, the `S`, `T` and `U` letters, each question short with numbered options and
the recommended one first (GRILL.md → *The grill*). Recommend what step 1 found: when it found a
value for certain, show it as option 1 ("keep `staging`"). Each round ends on its answer line.

- **S, the loop**: the runtime; the approver (the one tester and decider) and any partners who
  only watch; the code host, when there is no remote (below); the integration branch (when none
  exists, offer to create `staging` from the production branch, after a yes); the production
  branch; the milestones (use the existing ones, or the approver names the first two plus Later);
  the merged-not-released status; whether this project rebuilds an older app.
- **T, proof**: the gate commands (list the scripts found, or *Nothing built yet* below); whether
  CI runs the tests; the evidence kind (a project with no screen proves itself with a transcript),
  widths and entry screen; how a session checks a phone by itself (a simulator, when this computer
  has one); how a session makes a new test user, and the addresses that may get real messages; how
  a command gets a secret.
- **U, the rest**: the design tool and its explorations page; how the approver reads (plain words
  on or off, the ADHD profile on or off, notes); what the agent may do on hosting without asking;
  what holds a release (early or live users); whether to install the memory guard.

**No remote.** Offer two options:
1. The approver creates the repository and adds it as `origin`. Creating a repository is an
   outward step, so it takes their yes, and their own command when your permissions refuse it
   (`gh repo create <name> --private --source . --push`).
2. No code host: Branches → Code host CLI is `none`, and tickets merge locally after the
   approver's OK (RUNTIMES.md → *No code host*). Adding a remote later changes that one field.

**Nothing built yet, or a piece missing** (no scripts, no test runner, no video recorder for an app
with screens, maybe no commit). Recommend no stack and no tool: that is the first ticket's
decision, made by its MVP check and grill. Each field it decides (the Gate fields, Ports, Evidence →
Recorder, Design → Tokens file, as they apply) says `set by <ticket id>`, and step 4 creates that
ticket.

## 4. Write

1. Copy `config-template.md` to `docs/agents/domino-agents.md` and fill every field. A field the
   approver turned down says `none`.
2. Add one entry to the `## Agent skills` block that the mattpocock-skills setup wrote into
   `CLAUDE.md` (or `AGENTS.md`):

   ```markdown
   ### Coordinator loop

   Tickets run through the domino-agents loop. Its project config is `docs/agents/domino-agents.md`.
   ```

3. Prepare the tracker: the merged-not-released status (when the tracker's API cannot add it, ask
   the approver to add it in the tracker's settings), and the Later milestone. When a field says
   `set by`, also create that ticket, first in milestone 1 and blocking every other ticket there:
   *Set up <what is missing: the stack, the tests, the evidence recorder>*. Its description lists
   the config fields that say `set by` it, and its builder fills them in the same change.
4. Keep the evidence out of git: add Evidence → Folder to `.git/info/exclude` (local) or
   `.gitignore` (shared), as the approver picks. Create the Reports folder when the runtime needs
   one.
5. With a yes on the memory guard (and `jq` installed): copy
   `<this skill's base directory>/hooks/domino-memory-guard.sh` to `~/.claude/hooks/`, make it
   executable, and merge `<this skill's base directory>/hooks/settings-snippet.json` into
   `~/.claude/settings.json`. Test it: `touch ~/.claude/hooks/.domino-memory-guard-test` makes free
   memory read as 5%, so a session start is refused; then delete that file.
6. Get the setup files into `<integration>`: every builder's worktree starts from that branch, so
   a config that is not there reaches no builder. With the approver's yes:
   - When this setup creates `<integration>`, or the repository has no commit yet, commit the
     setup files on `<production>` first, then cut `<integration>` from that commit. This is the
     one commit `<production>` gets outside a release.
   - When `<integration>` already exists, commit on a branch and merge it into `<integration>`: a
     PR, or a local merge with no code host.

   Without a yes, the files stay in this checkout only, and each brief carries the config's
   absolute path.

**Done** when `grep -c '<fill:' docs/agents/domino-agents.md` prints 0 and every prerequisite is
present or turned down by the approver by name. Then go back to SKILL.md §0.
