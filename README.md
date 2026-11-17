# domino-agents

[![skills.sh](https://skills.sh/b/vmnog/domino-agents)](https://skills.sh/vmnog/domino-agents)

**One chat runs your project. You answer questions and watch videos; AI sessions do the rest.**

## Who it's for, and what it fixes

You use [Claude Code](https://docs.claude.com/en/docs/claude-code/overview), Anthropic's coding
agent that edits your repository and runs commands itself, and you want several tickets built at
the same time without becoming the bottleneck.

Running five agents at once is chaos without a plan. They ask questions while you are away, guess
at screens nobody drew, edit the same files, and merge code nobody tested. domino-agents puts one
chat in charge, the **Coordinator**. For each ticket it:

1. checks the ticket is worth building now, and finds the cheapest version (the **MVP check**);
2. asks you short questions with numbered options, until a builder has nothing left to guess
   (the **grill**);
3. gets the screens drawn first, when the ticket changes what people see (the **design gate**);
4. starts one **builder** session in its own git worktree, which builds test-first and records a
   video of itself using the app;
5. reviews the code, shows you the video, and merges into `staging` (never `main`) on your OK;
6. starts every ticket that merge unblocked, like **dominoes**.

You decide and approve; sessions write, test and review the code. You don't have to read the code:
you can still open any change, but the loop does not wait for you to. What makes that safe is the
merge gate every ticket passes: edge cases, a code review, your tests, your lint, then the video,
and only then your OK.

It was extracted from the working loop of a real product team, then dry-run on three test
projects: an empty folder, an ongoing web app, and a command-line tool built end to end from a
ticket to a release.

```text
idea or ticket
  → MVP check ─── defer / cut ──→ waits for your override
  → grill (one per ticket, all at once) ──→ decisions written on the ticket
  → design gate ─── no drawn screens ──→ designer session ──→ you pick
  → builder session (own worktree, test-first, video)
  → code review → you watch the video → merge into staging
  → domino: the tickets it unblocked start building
  → release: staging → main, when you ask
```

## Words you'll see

- **Skill**: a folder of instructions (a `SKILL.md`) that Claude loads when a task matches. This
  repository is mostly skills.
- **Plugin, marketplace**: Claude Code's package format, and a list of packages. This repository is
  both, so `domino-agents@domino-agents` means "the domino-agents plugin from the domino-agents
  marketplace".
- **Session**: one Claude Code chat with its own memory of the conversation. The Coordinator is one
  session; each builder is another.
- **Worktree**: a second folder of the same git repository, on its own branch, so two sessions edit
  at once without touching each other's files.
- **MCP**: how Claude connects to an outside tool, such as Linear or Figma.
- **Hook**: a script Claude Code runs before or after one of its own actions.
- **Approver**: you, the one person who answers questions and OKs merges.
- **Ticket, tracker, milestone**: a unit of work; where tickets live (Linear, GitHub Issues, Jira or
  plain files in the repository); an ordered group of tickets with a "done when" line.
- **Settled**: a ticket that passed its MVP check and its grill, so a builder can start.
- **The gate**: your test and lint commands. Every builder runs them before it reports.
- **Evidence**: what you review instead of code: a video and screenshots, or for a command-line
  tool, a transcript of each command and its output.
- **Board**: one drawn screen in a design tool (a Figma frame, say), not a Kanban board.
- **Integration branch**: where every ticket merges first (`staging` or `develop`). Production
  (`main`) gets it only at a release. "Staging" can also mean a deployed copy of the app, when you
  have one.

## What it does by itself, and what waits for you

| Does without asking | Always waits for you |
|---|---|
| Starts and closes sessions, one per ticket | Merging: your OK on the evidence |
| Writes code and tests on each ticket's own branch | A release to `main` |
| Runs the tests, the lint and a code review | Anything on production |
| Moves tickets in the tracker, keeps the release list | Hosting or infrastructure beyond what your config allows |
| Argues with your priorities: an MVP check can propose to defer or cut a ticket | Overriding that MVP check, or any priority call |

## What it costs

Each builder, designer and grill is a full Claude Code session, and several run at once. On the
dry run, the setup plus one small ticket taken from MVP check to release used about $4 of usage at
API prices. A day of five tickets in parallel costs several times that. The optional memory guard
(below) keeps your computer from running out of memory, not your plan from running out of usage.

## Try it on a throwaway repository

The shortest path: Claude Code in a terminal, tickets as plain files, no GitHub remote, and no
screens. The dry run used exactly this.

1. Make a folder with a tiny program and one test, or leave it empty: the setup then makes "set up
   the stack and the tests" the first ticket.

   ```bash
   mkdir try-domino && cd try-domino && git init -b main
   ```

2. Start Claude Code there (`claude`), and type these into its chat box:

   ```text
   /plugin marketplace add vmnog/domino-agents
   /plugin install domino-agents@domino-agents
   /plugin install mattpocock-skills@claude-plugins-official
   ```

   Restart Claude Code if the commands in step 3 don't appear.

3. Run the two setups. The first asks where tickets live: pick local markdown. The second asks
   about three short rounds of questions: pick "no code host" when it asks about the remote.

   ```text
   /mattpocock-skills:setup-matt-pocock-skills
   /domino-agents:domino-agents
   ```

4. Say "take the first ticket". You get its MVP check and a grill round; answer it, and a builder
   starts in the background. Its evidence comes back to you for an OK.

## Before you start (a real project)

**Required**

| You need | Why |
|---|---|
| **Claude Code**: in a terminal, or better, the **Claude Desktop** app's Code tab | Desktop's linked sessions are threads you can open and talk to. A terminal also works, with less to click ([RUNTIMES.md](skills/domino-agents/RUNTIMES.md)). |
| **git** | Worktrees and branches |
| **[mattpocock-skills](https://github.com/mattpocock/skills)**, with its setup run | `grilling`, `tdd`, `code-review`, `to-tickets`, and the setup that records where your tickets live |
| **A tracker**: Linear, GitHub Issues, Jira, or plain files in the repository | Ordered milestones, "blocked by" links and comments ([TRACKERS.md](skills/domino-agents/TRACKERS.md)) |

**Optional**

| You can add | What you get | Without it |
|---|---|---|
| A GitHub (or GitLab) remote, and `gh` logged in | Pull requests and their checks | Tickets merge locally after your OK |
| **The design skills**, for an app with screens (install step 3) | Design rules for designers and builders | Designers follow your project's own rules |
| A design tool's MCP: Paper, Figma or Pencil | Screens drawn and picked as boards | Designs are code variants and screenshots |
| A test runner that records video, such as Playwright | The builder's video, for an app with screens | The setup makes "add a recorder" a ticket |
| A phone simulator: Xcode's iOS Simulator or an Android emulator | Sessions check phone looks themselves | You check on your phone |
| A staging deploy: a site that redeploys from `staging` | You try each merge in a browser | You approve on the evidence alone |

## Install

1. **The plugin.** Open Claude Code in your project folder: in a terminal, `cd my-app && claude`; in
   Claude Desktop, the Code tab, then open the folder. Type into its chat box:

   ```text
   /plugin marketplace add vmnog/domino-agents
   /plugin install domino-agents@domino-agents
   ```

   The first line adds this repository as a source of plugins; the second installs the plugin from
   it. Restart Claude Code if `/domino-agents:domino-agents` does not appear.

2. **mattpocock-skills**, then its setup, in the project:

   ```text
   /plugin install mattpocock-skills@claude-plugins-official
   /mattpocock-skills:setup-matt-pocock-skills
   ```

   Its setup asks where your tickets live and writes `docs/agents/issue-tracker.md`. With no
   tracker yet, pick local markdown: tickets become files in the repository. domino-agents reads
   that answer and never asks again.

3. **The design skills** (optional, for an app with screens). In a terminal, in the project:

   ```bash
   npx skills add jakubkrehel/skills
   npx skills add emilkowalski/skills
   npx skills add Jakubantalik/transitions.dev
   npx skills add AgentsORG/design-engineering
   ```

   When the CLI asks, choose Claude Code, and this project. You get
   [jakubkrehel/skills](https://github.com/jakubkrehel/skills) (`better-ui`, `better-layout` and
   the other `better-*`), [emilkowalski/skills](https://github.com/emilkowalski/skills) (motion
   reviews, and a `prototype` skill for live variants),
   [Jakubantalik/transitions.dev](https://github.com/Jakubantalik/transitions.dev) (`transitions-dev`)
   and [AgentsORG/design-engineering](https://github.com/AgentsORG/design-engineering). Some of these
   also ship as Claude Code plugins: install each set one way only, or it is listed twice.

4. **The first run.** In a new session in the project, type:

   ```text
   /domino-agents:domino-agents
   ```

### Other ways to install

- **The skills CLI**, for any agent it supports (Claude Code, Codex, Cursor and others):
  `npx skills add vmnog/domino-agents`, and pick both skills. In Claude Code, the builder and
  designer then run as general-purpose subagents that read their role file first. The command is
  `/domino-agents`.
- **Copy the files**, into the project or into `~/.claude/` for every project:

  ```bash
  git clone https://github.com/vmnog/domino-agents ~/src/domino-agents
  mkdir -p .claude/skills .claude/agents
  cp -R ~/src/domino-agents/skills/* .claude/skills/
  cp ~/src/domino-agents/skills/domino-agents/agents/* .claude/agents/
  ```

  The command is then `/domino-agents`.

## First run

The first run is a setup, about three rounds of questions:

1. It looks at the project: branches, test scripts, `CLAUDE.md`, the tracker setup, and the tools
   this session has.
2. It shows what is present and what is missing, and stops when a required piece is missing.
3. It asks what it could not find out. Every question has numbered options with its pick first,
   and each round ends with an answer line that you copy or edit:

   ```text
   S1 - 1, S2 - 1, S3 - 2
   ```

4. It takes the role (the chat becomes "<Project> - Coordinator"), explains how sub-sessions work,
   and tells you where the project stands in five lines.

Then say "what's next", "take ABC-12", or describe an idea.

**What the first run changes, each with your yes:**

- writes **`docs/agents/domino-agents.md`**, the config: branches, test commands, ports, what the
  evidence must show, the design tool, how secrets are reached, what holds a release, and how you
  like to read. Edit it by hand any time;
- adds a pointer to that config in `CLAUDE.md`;
- adds a merged-but-not-released status and a "Later" milestone to the tracker, and for a project
  with nothing built yet, a first ticket that sets up the stack and the tests;
- adds the evidence folder to `.gitignore` (or `.git/info/exclude`);
- creates the integration branch when there is none. Then the setup files get one commit on `main`
  first, and `staging` is cut from it: the only commit `main` gets outside a release;
- installs the memory guard, when you say yes.

## A normal day

- **Grill rounds** arrive in their own sub-sessions, one per ticket, each with its own letter
  (`A1`, `B1`). Answer in the sub-session, or paste the answer line in the Coordinator.
- **Board picks**: links to the design file, the boards named left to right, numbered options.
- **Evidence**: the Coordinator sends each builder's video and screenshots after its own code
  review. Say OK, or what to change.
- **Staging**: after a merge, numbered steps to try the change.
- **Release**: say "release", and it lists what still holds the release first.

The Coordinator closes finished sessions by itself and starts the next ones, so the sidebar shows
only live work.

## Optional: the memory guard

Each session is a Claude process, and a builder also runs a dev server and a browser. Several
started at once once froze a 24 GB laptop. The guard is a Claude Code hook that refuses to start a
session when memory would go over 90%. It works on macOS and Linux and needs `jq`.

The easy way: say yes when the first run offers it; it installs and tests the guard for you. It is
not on by default because a plugin's own hooks cannot be switched off.

By hand: copy `skills/domino-agents/hooks/domino-memory-guard.sh` (in the plugin's folder, whose
path the first run prints) to `~/.claude/hooks/`, make it executable, and merge this into
`~/.claude/settings.json` (the same block is in `skills/domino-agents/hooks/settings-snippet.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__ccd_session__start_session|Agent|Task",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/domino-memory-guard.sh",
            "timeout": 10,
            "statusMessage": "Checking memory before starting a session"
          }
        ]
      }
    ]
  }
}
```

To test it, `touch ~/.claude/hooks/.domino-memory-guard-test` (free memory then reads as 5%), ask
the Coordinator to start a session and see it refused, then delete that file. Its log is
`~/.claude/hooks/domino-memory-guard.log`, and its numbers are in the config's *Memory guard*
block.

## Without Claude Desktop

- **Claude Code in a terminal**: builders and designers run as background subagents in their own
  worktrees, and the Coordinator grills you itself. A session you want to talk to opens in a second
  terminal with `claude -w <ticket>`.
- **Another agent** (Codex, Cursor, Gemini CLI): you open each worktree and chat yourself, paste the
  Coordinator's brief, and sessions write their reports into a folder the Coordinator reads. See
  [AGENTS.md](AGENTS.md).

[RUNTIMES.md](skills/domino-agents/RUNTIMES.md) has the step-by-step table.

## What each helper skill does in the loop

| Skill | Used by | Without it |
|---|---|---|
| `mattpocock-skills:setup-matt-pocock-skills` | The setup reads the tracker answer it writes | Required: the setup stops |
| `mattpocock-skills:grilling` | Grill sessions | The grill follows the rules in GRILL.md alone |
| `mattpocock-skills:tdd`, `codebase-design` | Builders | Builders write each test first by the role file's short rule |
| `/code-review` (built in) or `mattpocock-skills:code-review` | The Coordinator, before you see the evidence | Use the one you have; one is always built in |
| `/mattpocock-skills:to-tickets`, `/mattpocock-skills:wait-what` | You type them: cut a feature into tickets; ask for a re-pitch | The Coordinator cuts tickets itself; ask "say it simpler" |
| The design skills (`better-ui`, `better-layout`, `transitions-dev`…) and a `prototype` skill | Designers, and builders on visible changes | Designers work from your project's own design rules |
| A design MCP (Paper, Figma, Pencil) | Designers, the design gate | Boards are code variants and screenshots |

## Files

```text
domino-agents/
├── .claude-plugin/        plugin.json and marketplace.json (this repo is its own marketplace)
├── skills/
│   ├── domino-agents/     the Coordinator: SKILL.md, SETUP, STATUS, FEATURE, GRILL, DESIGN,
│   │                      RELEASE, TRACKERS, RUNTIMES, config-template.md,
│   │                      agents/ (the builder and designer roles sessions play),
│   │                      hooks/ (the optional memory guard)
│   └── mvp-challenge/     the MVP check and its devil's-advocate prompt
├── AGENTS.md              for agents other than Claude Code
└── LICENSE                MIT
```
