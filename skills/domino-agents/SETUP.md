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
- What the mattpocock-skills setup writes (§2): `docs/agents/issue-tracker.md`,
  `docs/agents/domain.md`, `docs/agents/triage-labels.md` when the `triage` skill is installed, and
  an `## Agent skills` block in `CLAUDE.md` or `AGENTS.md`.
- The design system, for a project with screens: a design brief (`DESIGN.md`), a token file or
  theme (`tokens.css`, `theme.ts`, `tailwind.config.*`, CSS variables), a component library, a
  font setup, an icon package, brand folders (logos, app icons), and the design file's foundations
  page. FOUNDATIONS.md → *When it runs* says what each finding means.
- This session's model: its family is the recommended Coordinator model.
- This session's tools and skills: `start_session` present means the runtime is `claude-desktop`;
  the `mattpocock-skills` skills and the design skills (`better-ui`); the `mobbin-ui-research` skill
  and a Mobbin MCP (its `search_screens` tool); a tracker MCP (Linear, Jira); a design MCP (Paper,
  Figma, Pencil); `gh auth status`.
- The operating system, for the memory guard (macOS and Linux are supported).

## 2. Check the prerequisites

Show the approver one table: each prerequisite, present or missing, and what is lost without it.

| Prerequisite | Needed for | When it is missing |
|---|---|---|
| `mattpocock-skills` installed, and its setup run in this repository (every file in *The mattpocock-skills setup* below exists) | The tracker answer, `grilling`, `tdd`, `codebase-design`, `code-review`, `to-tickets` | **Stop here.** Hand the setup to the approver as *The mattpocock-skills setup* below says, and wait. Every later step reads the tracker answer. |
| The design skills installed (`better-ui` at least). They are third-party skills: the approver reads and installs them (README → *Install*, step 3) | Designers and builders on anything a person sees | A project with a UI goes on only with the approver's yes: designers then work from the project's own rules alone. A project with no UI skips it. |
| A tracker that answers one read call (list the milestones) | Every step | Stop and fix the connection. |
| `gh` (or `glab`) logged in, when the repository has a remote | PRs, the duplicate-work check | Stop and ask the approver to log in. With no remote, round S asks about the code host instead. |
| A design tool's MCP | The design gate's boards | Design → Tool is none: boards are code variants and screenshots (DESIGN.md). |
| The `mobbin-ui-research` skill and the Mobbin MCP (README → *Install*, step 3), only when the approver wants Mobbin references | Designers, on a screen the project has no reference for (DESIGN.md → *External references*) | Design → External references is none: designers draw from the project alone. |

**Installs are the approver's.** No agent installs a skill, a plugin or a hook, and no agent edits
`~/.claude/` or another user-wide setting (SKILL.md → *Trust*). For each missing prerequisite,
point to its README step and wait for the approver's word that it is done.

### The mattpocock-skills setup

**The approver runs it; you never do.** Its skill is marked non-invokable on purpose: no agent and
no other skill may start it. Do not load it, run it, or write its files yourself. Hand it to the
approver and wait for their word that it finished.

**What to hand over.** Two commands, typed into this Claude Code session's message box, one at a
time, each in a `text` code block:

```text
/plugin install mattpocock-skills@claude-plugins-official
/setup-matt-pocock-skills
```

Say plainly: these are Claude Code commands, not terminal commands. They do not start with `!`
and they do not go in a terminal, because a shell answers "no such file or directory". Never put
them in a `bash` code block. When the install is new, Claude Code may need a restart before the
second command appears in the `/` menu. If another command already uses the bare name, the
namespaced form `/mattpocock-skills:setup-matt-pocock-skills` runs the same setup.

**What the approver will be asked.** The setup proposes the tracker that matches the git remote.
Its options are GitHub (needs `gh`), GitLab (needs `glab`), local markdown (files under
`.scratch/`), or Other, where the approver describes the workflow in a paragraph and the setup
records it as prose. Linear, Jira and every other tracker go through Other. When neither
`CLAUDE.md` nor `AGENTS.md` exists, it asks which one to create.

**What it writes**, all committed in this repository (there is no global mode, so each repository
runs it once):

- `docs/agents/issue-tracker.md` and `docs/agents/domain.md`;
- `docs/agents/triage-labels.md`, only when the `triage` skill is installed;
- an `## Agent skills` block in `CLAUDE.md` when it exists, else in `AGENTS.md`.

Check for every one of them before you go on, not only `issue-tracker.md`. When one is missing,
say which and ask the approver to run the setup again.

**Labels.** `triage-labels.md` is only a mapping from roles to label names. On a fresh GitHub
repository the labels may not exist yet. §4.3 checks every label this loop uses and creates the
missing ones.

**When to run it again.** Once per repository, before any engineering skill. Again only to switch
trackers, or when a skill stops doing what its docs describe after a skills update.

## 3. Ask

At most three rounds, the `S`, `T` and `U` letters, each question short with numbered options and
the recommended one first (GRILL.md → *The grill*). Recommend what step 1 found: when it found a
value for certain, show it as option 1 ("keep `staging`"). Each round ends on its answer line.

- **S, the loop**: the runtime; the models (SKILL.md → *Models*): the Coordinator's, recommended
  as the family this session runs on, and the sub-sessions' default, recommended as the same family
  or one below it, with a per-role override only when the approver names one; the approver (the one tester and decider) and any partners who
  only watch; the code host, when there is no remote (below); the integration branch (when none
  exists, offer to create `staging` from the production branch, after a yes); the production
  branch; the milestones (use the existing ones, or the approver names the first two plus Later);
  the merged-not-released status; whether this project rebuilds an older app; the trusted authors
  (tracker users besides the approver whose comments count as decisions; recommend none).
- **T, proof**: the gate commands (list the scripts found, or *Nothing built yet* below); whether
  CI runs the tests; the evidence kind (a project with no screen proves itself with a transcript),
  widths and entry screen; how a session checks a phone by itself (a simulator, when this computer
  has one); how a session makes a new test user, and the addresses that may get real messages; how
  a command gets a secret.
- **U, the rest**: the design tool and its explorations page; for a project with screens, what
  step 1 found of the design system, and whether the foundations ticket draws new foundations or
  imports the ones in code (FOUNDATIONS.md); for a project with screens, whether designers search
  Mobbin before they draw a screen the project has no reference for (DESIGN.md → *External
  references*: recommend `mobbin` only when step 1 found both the skill and the Mobbin MCP, else
  `none`; with `mobbin` picked and either missing, point to the README step); how the approver reads (plain words
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

**Screens, but no design system** (no brief, no foundations page, or no token file). Recommend no
brand and no tokens yet: the foundations ticket decides them with the approver (FOUNDATIONS.md).
Design → Brief, Tokens file, Brand assets and Icon set say `set by <foundations ticket id>`, as
they apply.

## 4. Write

1. Copy `config-template.md` to `docs/agents/domino-agents.md` and fill every field. A field the
   approver turned down says `none`.
2. Add one entry to the `## Agent skills` block that the mattpocock-skills setup wrote. It is in
   `CLAUDE.md` when that file exists, else in `AGENTS.md`: the same rule the setup used. Never add
   a second block in the other file.

   ```markdown
   ### Coordinator loop

   Tickets run through the domino-agents loop. Its project config is `docs/agents/domino-agents.md`.
   ```

3. Prepare the tracker: the merged-not-released status (when the tracker's API cannot add it, ask
   the approver to add it in the tracker's settings), and the Later milestone. On GitHub or
   GitLab, check that every label the loop uses exists: the status labels (TRACKERS.md →
   *Statuses*) and, when `docs/agents/triage-labels.md` exists, each label it names. List them
   (`gh label list`, `glab label list`) and create each missing one (`gh label create <name>`,
   `glab label create --name <name>`). The setup files only map names; they may not create the
   labels. When a field says `set by`, also create that ticket, first in milestone 1 and blocking every other ticket there:
   *Set up <what is missing: the stack, the tests, the evidence recorder>*. Its description lists
   the config fields that say `set by` it, and its builder fills them in the same change.
   When a Design field says `set by`, also create *Design foundations* (FOUNDATIONS.md) in
   milestone 1: blocked by the setup ticket when there is one, and blocking every ticket that
   changes what a person sees. Its description says whether it creates or imports.
4. Keep the evidence out of git: add Evidence → Folder to `.git/info/exclude` (local) or
   `.gitignore` (shared), as the approver picks. Create the Reports folder when the runtime needs
   one.
5. With a yes on the memory guard: the approver installs it by hand (README → *Optional: the
   memory guard*). It changes `~/.claude/settings.json`, which every Claude Code session on this
   computer reads, so no agent edits it. Give the approver that README section and go on; until
   they say it is installed, read free memory before each start (RUNTIMES.md → *Reading free
   memory*).
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
