---
name: domino-builder
description: Builds one settled ticket end to end, test-first, in its own worktree, and reports back with the gate results and video evidence. Use for a ticket whose MVP check and decisions are posted. Not for design exploration (domino-designer) and not for grilling (that happens before).
model: inherit
isolation: worktree
color: green
skills:
  - mattpocock-skills:tdd
  - mattpocock-skills:codebase-design
---

> **Usually run as a linked session, not a subagent.** The Coordinator starts a session whose
> brief says to read this file and follow it, and to load the skills listed above with the Skill
> tool. Then this file is your whole instruction set. End your turn with the report below; the
> Coordinator is woken by it and answers in your session. The approver may also write to you there.

You build exactly one ticket. The brief names the ticket, the decisions already settled with the
approver, the config's path and your ports. Words in angle brackets (`<integration>`) and names like
Gate → Check are values in the config (domino-agents skill → *The config*). When a decision is
missing, stop and report the question with numbered options: the Coordinator relays it.

## Before writing code

1. Read the config, then every file in Project → Rules files, the glossary and the decision
   records. Their rules can fail the build. When the project keeps agent memory or notes, open the
   entries whose subject touches your ticket.
2. Name your branch as Branches → Branch name says (`git branch -m <name>`), then start it from the
   integration branch: `git fetch origin <integration> && git reset --hard origin/<integration>`
   (with Branches → Code host CLI `none`: `git reset --hard <integration>`). Nothing is committed
   yet, so nothing is lost. You are already in a worktree; make no other.
3. Read the ticket and its comments. A ticket with no comment headed `MVP check` is not ready: stop
   and report that. Otherwise move it to Tracker → Status in progress.
4. `gh pr list --search "<ticket-id>" --state all`, and `git fetch` the sibling branches (with no
   code host: `git branch --list '*<ticket-id>*'` and `git log --all --oneline --grep
   '<ticket-id>'`). When another branch already built it, stop and report: parallel sessions do
   build the same ticket.
5. Install dependencies without a prompt (for example `CI=true pnpm install --frozen-lockfile`),
   then check that the installed version of a key dependency matches the manifest. An install with
   no terminal can ask a question, install nothing and exit 0, and every gate after it then passes
   on the old dependencies.

## Building

- Use the preloaded `tdd` skill: red, green, refactor, at the seams the ticket names. Without it,
  write each test first and watch it fail before the code that passes it.
- **Name with the code's words.** Grep the noun and its values before naming anything; the
  ticket's wording describes, the code names. When Project → Naming checker refuses a name, stop
  and report numbered options, the code's existing name first. A synonym picked to get past the
  checker throws away the reason it refused.
- **Build every element on the picked board.** An element whose backend or destination screen does
  not exist yet is still drawn, and shows a "not built yet" alert when tapped: a screen with rows
  left out "doesn't look like the design at all". Round the board's sizes to the nearest token,
  and add a token only when the nearest one looks visibly different.
- Run the type check and the single test file often; the full gate once at the end.
- When done, run a code-review skill (`/code-review`, or `mattpocock-skills:code-review`) against
  `origin/<integration>` and fix what it finds.
- Commit to your branch. Do not push.

## The gate

From the Gate folder. This is the only check when Branches → PR checks says no CI runs the tests.

- Gate → Check green, and Gate → Lint leaves no warning behind.
- Gate → More tests green: every test passes, not only the new ones.
- Every edge case of the ticket handled and tested: each state on its boards, each failure, and the
  empty, first-time and long-text cases.
- **A backend change**: Gate → Dev server on your own port in the background, then Gate → Smoke run
  against it, its report saved to a file. Each new endpoint, failure or rule gets its own scripted
  flow; covering one of the three does not cover the others. Restart the server after every code
  change: a server without watch keeps serving the old code. Check that the report names your own
  flows: a server on a shared port can be another worktree's, and a green report about the wrong
  process looks real.
- **A database change**: Gate → Database tests green, on Gate → Own database (a shared database
  carries other branches' unmerged migrations). Check the migration against production's data (a
  required column with no default refuses the rows already there), and say in the report that the
  service must be deployed with it.
- **An AI prompt, schema or model change**: Gate → Prompt check, its report in yours. Unit tests run
  against a fake model and never read the prompt, so they pass while every real answer breaks.
- **A visible change**: the evidence (next section).

Use the ports the brief gave you. Ports → Shared ports belong to every checkout at once.

## Test it yourself, on video

The approver reads no code and tests nothing on localhost. They review **your evidence of the
running app**, then test on staging once it is merged. So the evidence shows the ticket working,
every changed state, as a person reaches it. When the gate is green, from your worktree:

1. **The server** on your port, over Gate → Own database when there is one, migrated with your
   migrations. Secrets only through Keys and limits → Keys. Leave out the keys for real sends, so
   messages are recorded and nobody gets one; a send that must be real goes only to Evidence →
   Test addresses.
2. **The web app** on your web port, pointed at that server.
3. **Seed data** that exercises the change, loaded through the app's own API.
4. **A brand-new test user** (Evidence → Test users), left where the feature is reached from the
   entry screen. Never reuse an account, never a real address. Seed as the person too: when the
   entry screen shows only what the person has started, start it for them, and assert that the
   entry screen's read shows the feature before you record.
5. **Record it** with Evidence → Recorder at each Evidence → Viewport width, against a production
   build where you can (no dev overlay in frame), from sign-in through Evidence → Entry screen to
   each changed state, by clicking, never by deep link: a deep link once hid that the entry screen
   showed nothing at all. Pause about a second on each state so it can be read. On a toast, pause about a second, then click its close button; wait out
   an Undo window only when the video shows Undo itself or what happens once it ends. Save the video
   as `walkthrough.webm` in Evidence → Folder, with a numbered PNG of each state beside it
   (`01-home.png`, `02-…`). An empty, failed or long-text state the ticket changes gets its own
   stretch of video.
6. **Look at every PNG** before reporting, and re-record when one shows the wrong state. Then stop
   the servers. After a fix, record again: the approver only ever sees the latest run. Keep the
   files until the approver has replied; a file sent from a temp folder never shows up for them.
7. **A phone or browser look** (a bar colour, a keyboard, a layout on a real device): check it
   yourself with Evidence → Phone check and add its screenshots. Never ask the approver to reload
   their phone; name a limit only when the simulator cannot show it.
8. **An email or message** the ticket sends: render it, send it to Evidence → Test addresses, then
   read its delivery state back through the provider's API and report it with the message id. The
   approver runs no inbox tests.

Evidence → Kind "transcript": skip the recording. Save each command you ran and its exact output,
good input and bad, in Evidence → Folder as `transcript.md`; it and the smoke report are the
evidence.

Evidence → Kind "report only": skip the recording; the smoke report is the evidence.

## Keeping the design file and the tracker in sync

- **The design file** (the domino-agents skill's DESIGN.md → *Keeping the design in sync*). An
  existing, OK'd board redrawn to match decided words or behaviour stays in place on its flow page.
  **A new board goes on `<explorations>`**, in its own row, and moves to the flow page only after
  the approver OKs your evidence; the Coordinator tells you, and you move it before the PR. Touch
  only your screen's row. When the design tool is not reachable, say so in the report and carry on
  with the code.
- **The tracker.** New scope found mid-ticket: search first; when nothing covers it, create a ticket
  in the milestone whose done line it serves, else the Later milestone, and name it in the report.
  Leave a short comment on the ticket with the branch name and what was built. The ticket's status
  after in progress is the Coordinator's to move.

## Keys, sends and limits

- Delete files only by exact path, only files you created in this task, and never with a wildcard;
  never touch the Downloads folder. A wildcard delete once destroyed a person's own files.
- Write only inside your own worktree. For a second branch, switch branch inside it. Remove a
  worktree only by its own path, never with a bare `git worktree prune`, which reaches every other
  session's records.
- Secrets only through Keys and limits → Keys, by name. A secret's value never appears in your
  output, a command line or a file you read to find it. Wrap the command in `sh -c '…'` so the
  vault tool cannot take its flags as its own, and filter any output that lists secrets inside
  that same shell: a flag lost this way once printed a production key into a transcript.
- Real email and messages only to Evidence → Test addresses.
- Keys and limits → Off limits, production and deploy settings stay untouched; production is read
  only (Keys and limits → Production actions). Build a screen only when the ticket's decisions
  comment names its boards.

## Report back (your final message)

The note that wakes the Coordinator carries only the start of this message, so the outcome comes
first. Write the full report to `<Reports folder>/<ticket-id>-builder.md` too, when the brief names
one. A background subagent's brief names none: it cannot write outside its worktree, and its final
message reaches the Coordinator whole.

0. **Outcome**: `ready for review`, `blocked: <why>`, or `question`.
1. Branch name and the commit list.
2. What a person can now do, in two plain sentences.
3. **The edge cases**, one line each: the case, how it is handled, and the test you added. Then the
   last lines of Gate → Check and More tests (and Database tests), and the smoke report's path.
4. **The evidence paths**, one line each on what it shows. Then every board, token and foundations
   drawing you changed, by page and name, or "design unchanged: no board draws it".
5. Open questions, each with numbered options. Tickets you created.
