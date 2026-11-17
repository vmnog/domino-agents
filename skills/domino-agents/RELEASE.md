# The integration branch and the release

## A pull request merged into the integration branch

1. Move its ticket to `<merged-status>` at once, unasked, a status of the "started" kind: the
   ticket stays open until the release, because a change can still be pulled or broken before it.
   One PR can close several tickets; move each. When the tracker has no such status, ask the
   approver to add it in the tracker's workflow settings, and leave the ticket in progress
   meanwhile, never Done. A ticket left in progress after its code merged reads as active work.
2. Add its row to the open release ticket (Release → Release ticket, in the current milestone),
   creating it when none is open. The row says how the change was proved: **evidence OK'd** with
   the date, **nothing to test** (docs, tests, tools), or **needs a real device** when only a real
   phone, a live call or a real payment can show it. Rewrite the ticket's *What's new* for the
   people who use the app every time a row is added.
3. Check the ticket against git: `git log --oneline origin/<production>..origin/<integration>`
   (no code host: RUNTIMES.md → *No code host*).
   Done when every pull request in that list has a row. A release ticket that falls behind hides
   what is about to ship.
4. Tell the approver it is on Release → Staging URL, with numbered steps from the entry screen to
   the change, and which test login to use. When they say it works, tick its row.

## The release

It goes out when the approver asks. Release → What holds it says which rows hold it:

- **Early** (no real users yet): a row whose evidence the approver OK'd counts as tested. Two kinds
  of row hold the release: one marked **needs a real device** that they have not ticked, and one
  whose evidence they have not OK'd.
- **Live users**: every row is ticked on staging, and an untested row holds the release.

Before the approver decides, list the rows that hold it, each with the one thing they have to do.

1. Run Release → Before it goes out, and check every migration in the release against
   production's data. A production write (a script, a data fix, a variable) belongs to Keys and
   limits → Production actions: agents read production only. Hand the approver the exact one-line
   command and the output to expect, and check that what they paste back is the new run, not an
   old one. Every write step comes as a pair: a read-only check first (a count or a preview of the
   rows it touches) and its expected result, then the write and the rows it should change.
2. `git fetch origin && git push origin origin/<integration>:refs/heads/<production>`, a
   fast-forward, never a force. A refused push means `<production>` has a commit of its own: merge
   `<production>` into `<integration>` first, through a PR. With no code host, RUNTIMES.md → *No
   code host* has the local fast-forward.
3. Run Release → After it goes out, move every ticket in the release from `<merged-status>` to the
   released status with its PR link, close the release ticket, and tell the approver it is live.
4. Done when no ticket is left in `<merged-status>` and the release ticket is closed. One left open
   hides the state of the next release.

## Staging is production's twin

Staging exists to predict production, so it runs the same code paths: real sends (to test
addresses), the same screens, no switches of its own. Only the database, the keys and the branch
differ. A behaviour that exists only on staging is a defect, not a convenience.

## Nothing skips the integration branch

Every pull request goes into `<integration>`, including docs and agent files, and `<production>`
gets `<integration>` only through a release. For a production fix, ask the approver before doing
anything else: the default is `<integration>` and then a release, which ships everything waiting on
`<integration>` with it.

**A change to agent files reaches sessions on its own clock.** Builders and designers cut from
`origin/<integration>`, so role files kept in the repository reach them as soon as they merge. The
Coordinator loads its skills from its own checkout, so it gets the change only after that checkout
updates; until then it follows the merged files on `origin/<integration>`. Installed as a plugin,
the files change only with `/plugin update`.
