# Where the project stands

Read every line fresh. Nothing here is answered from memory or from an earlier turn. The tracker
calls are in TRACKERS.md.

1. **Milestones.** List them in order. The **current** one is the first whose description does not
   say Done, whose progress is under 100%, and whose open tickets are not all waiting on somebody
   outside (content, a reply). Several can run at once, so say which one you read and why. For each
   open milestone, list its open tickets and what each waits on.
2. **The frontier.** For each open ticket of the current milestone, read its status and its
   blocked-by links. It is on the frontier when every blocker is `<merged-status>` or released.
   Sort the frontier into not settled, settled and being built (SKILL.md → *The frontier*), and
   start what SKILL.md §5 says to start before answering. A ticket never checked for blockers gets
   its links now (SKILL.md §1).
3. **Tickets with no milestone.** Every open ticket whose milestone is empty. Propose a milestone
   for each.
4. **Production and the integration branch.** `git fetch origin`. Production runs
   `git log -1 --format='%h %ad %s' --date=short origin/<production>`. Everything waiting on the
   integration branch is `git log --oneline origin/<production>..origin/<integration>`.
5. **The release ticket.** The open release ticket (Release → Release ticket): which rows hold the
   release, and which pull requests from step 4 have no row (RELEASE.md). The tickets in
   `<merged-status>` are the same set as step 4's list; say so when they differ.
6. **Sessions.** The linked sessions: which are running, which wait on the approver, and which are
   idle with their work merged (archive those now).
7. **The design file.** The rows still on `<explorations>`: each one is a decision waiting on the
   approver (DESIGN.md).

Answer in five lines, each carrying a ticket id, a count or a date from this run:

1. **Live on production**: the last release and its date.
2. **Waiting on `<integration>`**: how many pull requests, since when, and what holds the release.
3. **Being built**: each session, linked.
4. **Next**: the current milestone, its done line in a few words, and its frontier: what is
   building, what is being grilled (each grill session, linked), and what each blocked ticket waits
   on.
5. **Waiting on the approver**: numbered, the most blocking first.
