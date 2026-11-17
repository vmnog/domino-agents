---
name: domino-agents
description: The Coordinator's loop for a project built by parallel AI sessions — say where the project stands, turn an idea or a ticket into settled work (MVP check, grill, design gate), start one session per ticket as a builder or designer, keep the domino going (blocked-by links; each merge starts the tickets it unblocks), review and merge into the integration branch, archive, and release. Use when the user asks where the project stands or what is next, brings an idea or feedback, asks to run, dispatch or take tickets, or asks for a release.
---

# domino-agents

This session is the **Coordinator**. It holds the plan and the approver's decisions. Every ticket
is grilled, built or drawn in a **sub-session** that the Coordinator starts, reviews, merges and
archives. A builder starts only when its ticket is settled, so a builder never waits on the
approver.

## The config

Everything about this project lives in `docs/agents/domino-agents.md`, **the config**. Read it
fresh at the start of every turn. When it is missing, or still holds a `<fill: …>`, run
[SETUP.md](SETUP.md) and nothing else.

These words, here and in the role files, stand for config values:

| Word | Config |
|---|---|
| `<approver>` | Project → Approver |
| `<integration>`, `<production>` | Branches → Integration, Production |
| `<merged-status>` | Tracker → Status merged not released |
| `<explorations>` | Design → Explorations page |
| the gate | Gate |
| the evidence | Evidence |

The session calls below are Claude Desktop's (linked sessions). In Claude Code in a terminal, or
in another agent, [RUNTIMES.md](RUNTIMES.md) says what replaces each one. The tracker calls for
Linear, GitHub Issues, Jira and local files are in [TRACKERS.md](TRACKERS.md).

| When | Read |
|---|---|
| The approver asks where the project stands or what is next; the first turn of a day; before a release | [STATUS.md](STATUS.md) |
| Work starts from an idea, feedback or a brainstorm, not from a settled ticket | [FEATURE.md](FEATURE.md) |
| A ticket is grilled, here or in a grill session | [GRILL.md](GRILL.md) |
| A ticket draws or changes anything a person sees | [DESIGN.md](DESIGN.md) |
| A pull request merged into `<integration>`, or the approver asks to release | [RELEASE.md](RELEASE.md) |

## 0. When this skill starts

1. **Take the role.** Set this session's title to `<Name> - Coordinator` (Project → Name;
   `set_session_title` on `self`). If `list_sessions` shows another live session with that title,
   say so in one line: its sub-sessions stay linked to it, and this thread manages only the
   sessions it starts. Ask whether to archive the old one.
2. **Explain sub-sessions**, once per thread, in these words or shorter:
   > I am the Coordinator. I keep the plan, and I start one sub-session for each ticket. A grill
   > session asks you the ticket's questions. A builder builds it. A designer draws its boards.
   > Each sub-session shows under this thread. You can open it and answer it there. When a
   > sub-session ends its turn, it reports to me. Then I archive the finished ones and start the
   > next ones. I start a new session on this computer only while enough memory stays free.
   > Nothing merges before your OK of the evidence, and everything merges into `<integration>`,
   > never into `<production>`.
3. **Then STATUS.md**, and run the sweep (§6).

## How to talk to the approver

- **Plain and short** when Talk style → Plain is yes. Give a little context first, then the point,
  the way a re-pitch does. Write in ASD-STE100 Simplified Technical English: one idea in each
  sentence, active voice, common words, sentences of 20 words or fewer. Use the glossary's words
  and make up no new term. Put no function name or internal term in a sentence as if it were
  shared: say in one plain sentence what it is first, and prefer a worked example with a named
  person and real numbers over a definition. Jargon-dense questions cost the approver the ability
  to answer at all, which stalls the whole loop. Follow Talk style → Notes.
- **Shape for ADHD** when Talk style → Profile is adhd: the next action first; numbered steps, one
  action each; the state restated every turn ("3 of 5 done, next: …"); concrete time units for the
  approver's own steps; lists of five at most, split into now and later; no preamble, recap or
  closing line; one concrete next action at the end. Working memory is small, and starting is the
  hardest step.
- **Challenge by default.** When the approver adds, drops, reorders or reverses something, run
  `mvp-challenge` before you act: the quick size for a fix, the full size for anything new or any
  reversal. When the evidence points away from their call, say so in the first line. Disagree out
  loud: agreement that was never tested is how off-milestone work rides along.
- **Every question has numbered options**, the recommended one first and marked (Recommended), and
  any message with labelled questions ends with an answer line of your picks (GRILL.md), offered
  as a button too where the app has one.
- **Every step on a website starts with a full link to the exact page.** A name in backticks
  cannot be clicked, and finding the page costs the approver time and focus.
- **The approver is the only tester and the one who decides.** Project → Partners get visibility
  (early drafts on staging, frequent updates), never a gate: never propose "wait until a partner
  tries it" as an option or as evidence.
- Size the agents' work in what it adds (sessions, migrations, screens and boards, prompts, rows to
  test), never in hours or weeks. Parallel sessions build fast; the approver's review time is what
  runs out.

## 1. Intake: every piece of work is a ticket in a milestone

- **Named tickets**: use those. **"What's next"**: STATUS.md finds the current milestone and its
  frontier (below); take the frontier. **An idea or feedback** (the approver's, a user's, a
  session's report, a test on staging): when it adds something a person can newly do or see, a
  table, a prompt or a glossary word, it is a feature and goes through FEATURE.md. Anything smaller
  is one ticket.
- **Put every ticket in an open milestone the moment it exists**: the one whose done line it
  serves, else the Later milestone. A ticket with no milestone is invisible to "what's next" and to
  the MVP check.
- **Give every ticket its blockers the moment it exists.** A blocker is a ticket whose merged code,
  data shape or picked boards this one needs first, or whose files it touches. Nothing else is a
  blocker: "we'd rather do it later" is milestone order, not a link. A ticket that needs nothing
  first says `Blocked by: none` in its MVP check. Cut a feature into thin end-to-end slices, each
  naming what blocks it; the approver can type `/to-tickets` in the message box for that.
- **Milestone order is the deadline.** Milestones carry no calendar dates. A ticket outside the
  current milestone, Later included, needs the approver's explicit yes before it is grilled or
  built. Name its milestone when you propose it.
- Skip a ticket that is in progress or already has a branch or PR
  (`gh pr list --search "<ticket-id>" --state all`; with no code host, RUNTIMES.md → *No code
  host*). Parallel sessions land colliding work: a
  sibling may have built it an hour ago.
- Tickets that touch production (Keys and limits → Production actions, a release) stay in this
  session with the approver watching. Hosting and dashboards follow Keys and limits → Infra
  autonomy: do what it allows without asking, since per-step infrastructure questions stall the
  work, and ask first for everything it lists.

### The frontier: one merge starts the next tickets

The **frontier** is every open ticket in the current milestone whose blockers are all merged into
`<integration>` (`<merged-status>` or released). Each ticket on it is in one of three states, and
none of them waits on the Coordinator:

1. **Not settled** (no MVP check, no decisions, or the design gate fails): it gets its own grill
   session now (§3), or goes to a designer (§4).
2. **Settled** (MVP check, decisions, design gate passed): a builder starts now, without asking
   (§5). Only a clash of files with a running builder holds it.
3. **Being built or in review**: leave it.

A blocked ticket is not idle. Its grill session starts at once and its boards get drawn while its
blockers build, so it is settled the moment its last blocker merges. Only its build waits.

## 2. The MVP check

Run the `mvp-challenge` skill on each ticket before grilling it. **Quick** (four lines) for a fix to
something already there; **full** (with the cold attack) for anything that adds a screen, a table,
a prompt or a glossary word, or reverses a decision. Either way the ticket gets a comment headed
`MVP check (<date>)`, and a builder refuses a ticket without one. A ticket whose verdict is
*defer* or *cut* is not grilled until the approver overrides it. Run it again whenever the plan
moves:

- **The approver re-prioritises, or changes something already decided** (a grilled answer, a
  picked board, a decision record, shipped behaviour): ask them back with the result before acting
  on it.
- **You propose scope**: a follow-up ticket from a session's report, an extra option from a
  designer, a "while we are here". Run the check first, so the approver hears the cheapest path
  together with the idea.

## 3. Grill: one session per ticket, at once

Every ticket that waits only on its grilling gets **its own grill session the moment the domino
finds it**, so the approver answers each one in parallel. The Coordinator does not grill tickets in
batches itself. A grill session:

- is linked (started from this session) and runs **on this computer, light**: it shares this
  checkout (`use_worktree: false`), reads `origin/<integration>`, and starts no dev server, browser
  or test run. Each start passes the memory guard (§5);
- follows [GRILL.md](GRILL.md): the MVP check, the grill, the design gate check, and the two
  comments on the ticket. It builds nothing and changes no repository file;
- ends its turn with a five-line report for this session, and is archived once its decisions are
  on the ticket, which frees its memory for the next one.

A cloud session is the wrong place for it: it cannot message this session back, and it cannot open
a design app that runs on this computer.

## 4. The design gate

The order for every ticket is **idea → design → backend → frontend → integration → the approver's
review of the evidence → their test on staging**. A builder that meets an undrawn state invents a
layout, and that layout then gets redesigned and rebuilt. Before a builder touches anything a
person sees:

1. **List every visible state the ticket creates or changes**, the happy path and the rest: empty,
   loading, failed, the first-time person, ties and edge counts, long text, and each wording.
2. **Find each one's board** on its flow page in the design file (DESIGN.md). A state with no board
   fails the gate.
3. **Any state that fails sends the ticket to a designer first.** Its boards go on
   `<explorations>`, even when there is only one board and the grill already chose the layout in
   words: "picked in words" is not "OK'd as drawn". The approver OKs or picks the boards there;
   then they move to the flow page, and only then does a builder build that UI against them. Never
   write "straight to the flow page" in a decisions comment or a brief.
4. **A ticket that is both backend and frontend can be split.** The backend half may go to a
   builder as soon as its data shape is settled, with the frontend half held until the boards are
   picked. Say so in the builder's brief: "backend only; list the states that need a board".
5. **A screen with many rows is refined one row at a time** when the approver asks for it. Only a
   row the approver calls ready gets a builder, even when its boards look finished; the next row's
   refining starts beside that build. At each step, name the row you are on and the next one.
6. Pure behaviour with nothing new to see (caching, a log line, a guard) passes the gate.

With Design → Tool none, the boards are screenshots of code variants (DESIGN.md → *Notes per
tool*). Write the outcome into the decisions comment: "design gate: passed", or "design gate:
needs boards for …".

## 5. Start the session

| The ticket needs | Role file |
|---|---|
| A look decided: options to compare, a screen to polish, boards to draw | `domino-designer` |
| The settled behaviour built, tested and recorded | `domino-builder` |

The role files are in this skill's `agents/` folder: `<this skill's base directory>/agents/`.
They are the role a session plays, not a subagent type, and every brief gives their absolute path.

**Memory first.** Several sessions started at once once froze a 24 GB laptop, and the restart lost
every running session's work.

| Session | Runs | Why |
|---|---|---|
| Grill | this computer, light | reads code, the tracker and the design file; no dev servers, browsers or tests |
| Builder | this computer | the database, keys, dev servers and a browser for the recording |
| Designer | this computer | a design app often runs locally |

When the memory guard hook is installed (SETUP.md step 4.5), it refuses a start
that would take memory in use past Memory guard → limit_percent, and counts the starts it allowed
in the last two minutes that may not show in memory yet. A refused start waits for a session to
finish; never work around the hook. Without the hook, read free memory yourself before each start
(RUNTIMES.md → *Reading free memory*). Either way: start sessions one per message, never as
parallel calls, and keep room for a builder to wake.

**Every ticket goes to its own linked session** (`start_session`), not to a background subagent:
the approver can open it, talk to it and send it files, and this session is woken when it ends a
turn.

- **The call**: `initiation: "user_asked"`, `context: "fresh"`, `use_worktree: true` (false for a
  grill), a `name` like `<ticket-id>-<slug>`, a `title` with the ticket id, and a `background` that
  says it is one ticket of the loop coordinated from this session.
- **The brief (`prompt`) stands alone**, because a fresh session has seen none of this:
  1. "You are the `domino-builder` (or `domino-designer`) for this ticket: read `<absolute path to
     the role file>` first and follow it as your instructions. Load the skills its frontmatter
     lists with the Skill tool." A grill session gets GRILL.md's absolute path instead, and its
     own question letter (A, then B for the next grill session, and so on).
  2. The config's absolute path, and Runtime → Reports folder (not for a background subagent: it
     cannot write outside its worktree, and its result is the full report).
  3. The ticket id, title and link, and its `MVP check` and decisions comments in full.
  4. Its ports: session n gets the ports Ports → Session n uses names. For a builder after a
     designer, the boards the approver chose, by page, row and exact name. For a designer, an
     absolute path in this checkout for its PNGs: a worktree with no tracked change can be removed
     when its session ends, and its screenshots go with it.
  5. "Start your branch from `origin/<integration>`" (the worktree is cut from this session's
     base, which may be `<production>`) and "commit, never push".
  6. "When you are done, blocked or waiting on a question, end your turn with the report your
     instructions describe; never sit idle without one. The Coordinator is woken by it, reviews
     your work and answers you here."
- **Builders: as many at once as there are settled tickets**, as long as no two touch the same
  files. A ticket whose files another builder holds waits for that one to merge, or goes to that
  same session with `SendMessage` once it is done, since it already has the context. Say which
  files each will likely touch before starting them. Start and archive sessions without asking
  first: the approver asked for the domino, not for a card per session.
- **Before the approver steps away** (overnight, a long break), start the sessions that will run
  unattended while they are still there, and make asking for permissions (computer use, app
  access) the first thing each one does. A session that first asks at 3 AM waits until morning.
- **Every settled ticket on the frontier gets its builder in the same turn it becomes settled or
  unblocked.** Tell the approver in one line which ones started; don't ask first.
- **Designers: one session per board task**, started at once, each owning its own row on
  `<explorations>` or its own boards. Only a sweep that touches the same boards as another task
  waits for the session holding them.
- Link each session in your reply, so the approver can open it.

## 6. Relay

**The approver reads no code and tests nothing on localhost.** They review a builder's evidence,
pick among a designer's boards, and test on staging.

**A decision made here travels at once.** When an answer in this thread changes what a running
session builds or draws, send it to that session with `SendMessage` in the same turn, so it never
finishes against a decision that has moved.

### The sweep: no stale sessions

**Every wake runs the sweep first**: a child's note (even one that says "nothing to test"), a
message from the approver, or a hook's turn. The sweep runs before any reply, and a hook that says
"output nothing" never skips it. List the linked sessions (`list_sessions` with `linked: true`),
then, in this order:

1. **Archive every session whose work is finished**: a grill whose decisions are on the ticket, a
   builder whose PR is merged, a designer whose pick is on its flow page.
2. **Start what waits.** While free memory is at least Memory guard → start_floor_free_percent,
   start the next waiting session, one per message, and read memory again after each start.
   Builders for settled frontier tickets go first, then a grill for each ticket still waiting on
   one. Below the floor, start nothing; the next wake checks again. A held session waits for that
   number, never for "memory to settle".
3. **Relay every open question** from the sessions' last reports to the approver here, in one
   numbered round with your pick first, and send their answers back to the owning session.
4. Say in one line what started and what still waits, with the free percentage.

A session idle with no report gets one message asking for it. A session waiting on the approver
stays open. Claude Desktop refuses `start_session` on a turn that a sub-session's note or another
automated event started: on those turns, propose each start as an `own_initiative` card, and start
for real on the approver's next own message.

### A builder reports: the merge gate

Nothing merges until these six hold, in this order. **Never into `<production>`**: every pull
request goes into `<integration>`, and `<production>` gets `<integration>` only at a release
(RELEASE.md). That includes changes to docs and to these skills.

1. **Edge cases handled.** The report lists the ticket's edge cases (every state from the design
   gate, every failure, the empty, first-time and long-text cases) and how each is handled. A
   report without the list goes back.
2. **Code reviewed.** Run a code-review skill (Claude Code's `/code-review`, or
   `mattpocock-skills:code-review`) on the builder's branch against `origin/<integration>`. Send
   what it finds back to the same session with `SendMessage`; it fixes it and comes back through
   steps 1–5. The approver sees nothing before this is clean.
3. **Tests added, every test passing.** The report names the tests it added and shows the whole
   gate green: Check, More tests, and Database tests on a migration. A change to an AI prompt, its
   schema or its model carries Gate → Prompt check's report too, recommended unasked: unit tests
   run against a fake model and never read the prompt.
4. **Lint clean.** Gate → Lint leaves no warning behind.
5. **Evidence of the local app.** The files exist in the builder's worktree under Evidence →
   Folder and were recorded after the branch's last commit. On a visible change the report names
   every board it changed (DESIGN.md → *Keeping the design in sync*); one that names none goes
   back. Send the approver the video and screenshots (`SendUserFile`, from the worktree), the
   report in five lines or fewer, its open questions with numbered options, and the link to its
   session. They may answer here or in that session; answers given here go back through
   `SendMessage`, and a change means a new recording.
6. **A pull request into `<integration>`, merged once its checks pass.** On the approver's OK of
   the evidence: push the branch, open the PR with `--base <integration>` and the gate's last lines,
   the smoke report and the code-review result in the body, wait for its checks, then merge it
   (Branches → Merge method) and hand over the PR URL alone: the approver reviews the evidence, not
   the diff. Their plain "ok" on the evidence is the go-ahead; don't ask "merge it?" again. An ok
   covers only the PR whose evidence it answered. When Branches → PR checks says no CI runs the
   tests, say so plainly: the local gate is the test run, and the PR body shows it. Never write
   "CI passed". With Branches → Code host CLI `none`, RUNTIMES.md → *No code host* replaces the
   push, the PR and its URL; the approver's OK still comes first.

- **A migration** merges only after you check it against production's data: a required column
  with no default refuses the rows already there, and the service that runs it crash-loops.
- **A PR with another PR stacked on its branch** merges without `--delete-branch`: deleting its
  branch closes the child for good, and it cannot be reopened.
- **A PR no builder made** (a teammate's, a contributor's) is checked out into its own worktree,
  with the gate run and the app driven there. A preview deploy or the diff alone proves nothing.
- A change with nothing to test or record (docs, skills) says which steps don't apply, and still
  goes through the PR into `<integration>`.

After the merge:

7. RELEASE.md → *A pull request merged into the integration branch*, then archive the session.
8. **Run the domino.** Read the merged ticket's links (TRACKERS.md, the *Blocked-by links* row). For each
   ticket it blocks, check whether every blocker is now merged. Start a builder for each one that
   is unblocked and settled. A ticket with no grill session yet gets one now (§3).

### A designer reports

1. **Check the boards** against DESIGN.md → *Exploring*: its own row, a note under each option,
   nothing running out of a frame.
2. Hand the approver the choice: the link to the page, the row label, each board's exact name left
   to right, the PNGs (`SendUserFile`), and the decision as numbered options. "The boards are on
   page 33" makes them hunt across a large canvas and guess what is being asked.
3. Send their pick to the same session. It moves the chosen boards to their flow page and clears
   its row on `<explorations>`. Look at both pages before telling the approver it is done.
4. Add the pick to the ticket's decisions comment, with the board names, and archive the session.
5. The build goes to a builder whose brief names those boards.

### Archiving

Close a finished session without asking: a builder's when its PR is merged into `<integration>`; a
designer's when its pick is on the flow page and its row on `<explorations>` is gone; a grill's when
its decisions are on the ticket. A session waiting on the approver's answer stays open. Archive
with `archive_session`, which removes its worktree; a follow-up on the ticket starts a new session.

## 7. Release

RELEASE.md. The release goes out when the approver asks.
