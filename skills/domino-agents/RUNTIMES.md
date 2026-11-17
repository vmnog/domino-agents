# Runtimes

SKILL.md is written for Claude Desktop's Code tab, where a session can start **linked sessions**:
threads the approver can open, that report back and wake the Coordinator. Runtime → Agent in the
config says which runtime this project uses. Everything else in the loop (the MVP check, the grill
rules, the design gate, the merge gate, the domino) is the same everywhere; only the plumbing
changes.

## What replaces each call

| Step | Claude Desktop | Claude Code in a terminal | Another agent (Codex, Cursor, Gemini CLI…) |
|---|---|---|---|
| Take the role | `set_session_title` | Say "Coordinator" in the first line | The approver names the chat |
| Start a builder or designer | `start_session`, `use_worktree: true` | The Agent tool with the role as `subagent_type` (`domino-agents:domino-builder` as a plugin), run in the background; `isolation: worktree` in the role file gives it a worktree. Installed without the plugin (the skills CLI, or copied files): a `general-purpose` subagent with `isolation: worktree`, whose brief starts by reading the role file | The approver opens a worktree and a new chat there (below) |
| Start a grill | `start_session`, `use_worktree: false` | The Coordinator grills here, following GRILL.md | The Coordinator grills here |
| A session reports | Its turn ends and this session wakes with the report's first lines; the full report is in Reports folder | The subagent's result arrives as a notification, and it is the full report: a subagent isolated in its worktree cannot write to Reports folder | It writes its report into Reports folder; the approver says "reported" |
| The sweep's list | `list_sessions` with `linked: true` | The background tasks still running, plus `git worktree list` | The files in Reports folder, plus `git worktree list` |
| Answer a session | `SendMessage` to its `local_…` id | `SendMessage` to the subagent's id (it resumes with its context) | The approver pastes the answer into that chat |
| Show the evidence | `SendUserFile` from the worktree | The file paths | The file paths |
| Archive | `archive_session` (removes the worktree) | `git worktree remove <path>` once merged | `git worktree remove <path>`; move the report to `done/` |

## Claude Desktop

- The first message a linked session gets is its brief; its last message is its report. Only the
  first lines of the report reach the Coordinator, so the role files put the outcome first and
  write the full report into Reports folder.
- Desktop refuses `start_session` on a turn that a sub-session's note or another automated event
  started. Propose those starts as `own_initiative` cards, and start them on the approver's next
  own message.
- `SendUserFile` shows only files inside the session's folders. Evidence written to a temp folder
  reports success and never appears: write it into the worktree (Evidence → Folder).
- A cloud session (`target: "cloud"`) cannot message this session back and cannot reach a design
  app on this computer. Keep the loop's sessions local.
- A session cannot write into another session's worktree. To work on a second branch, switch
  branch inside your own worktree; to add a commit on a builder's branch, ask that builder.
- Every session shares one built-in browser, so a dashboard the approver signed in to once is open
  to all of them. A login page is one ask to the approver: never type a password, never sign out,
  and touch nothing beyond the task.
- Archiving removes the session's worktree. Outside Desktop, remove a worktree only by its own path
  (`git worktree remove <path>`), never with a bare `git worktree prune`, which reaches every other
  session's records.

## Claude Code in a terminal

- A background subagent cannot ask the approver anything mid-run; every open question comes back in
  its report. The Coordinator relays it, and sends the answer with `SendMessage`.
- The approver cannot open a subagent to talk to it. When a ticket needs that (a designer's long
  exploration, a builder the approver wants to steer), open a second terminal instead:
  `claude -w <ticket-id>-<slug>`, which starts Claude in a new worktree under `.claude/worktrees/`,
  and paste the brief as the first message. It writes its report into Reports folder, where the
  sweep finds it.
- Grilling runs in the Coordinator, one ticket at a time. Several tickets can share one message
  when each ticket's questions carry their own letter (`A1` for one ticket, `B1` for the next).

## Another agent

The skill files are plain markdown, so any agent that reads files can run the loop.

1. The project's `AGENTS.md` points at the skill (the domino-agents repository's `AGENTS.md` has the snippet).
2. The Coordinator is a chat whose first message is: "You are the Coordinator. Follow
   `<path>/skills/domino-agents/SKILL.md`. The runtime is `other`."
3. A session is a worktree and a chat, opened by the approver:

   ```bash
   git fetch origin
   git worktree add ../<ticket-id>-<slug> -b <ticket-id>-<slug> origin/<integration>
   ```

   Then a new agent chat in that folder, with the Coordinator's brief as its first message.
4. The session writes its report into Reports folder and ends its turn. The sweep reads that
   folder.
5. Skills such as `grilling` and `tdd`: install them where the agent loads skills, or read their
   `SKILL.md` by path.

## No code host

A repository with no remote has no pull requests. Branches → Code host CLI is then `none`, and the
loop keeps every step, the approver's OK of the evidence included: only the plumbing changes to
local git. Worktrees share the local branches, so `<integration>` is the same branch in every
worktree.

| Step | With a code host | With none |
|---|---|---|
| A builder starts from the integration branch | `git fetch origin <integration> && git reset --hard origin/<integration>` | `git reset --hard <integration>` |
| Is someone already building this ticket? | `gh pr list --search "<ticket-id>" --state all` | `git branch --list '*<ticket-id>*'` and `git log --all --oneline --grep '<ticket-id>'` |
| Merge gate step 6 | Push, open the PR into `<integration>`, wait for its checks, merge | In the checkout that has `<integration>` checked out (`git worktree list` names it; when none does, add one: `git worktree add ../<repo>-<integration> <integration>`), merge the ticket's branch by Branches → Merge method, with `<ticket-id>: <title>` as the message and what a PR body would hold (the gate's last lines, the smoke report, the code-review result) as its body. Hand over the merge commit's hash where a PR URL would go. |
| What a release holds | `git log origin/<production>..origin/<integration>` | `git log <production>..<integration>` |
| The release | `git push origin origin/<integration>:refs/heads/<production>` | Check it is a fast-forward (`git merge-base --is-ancestor <production> <integration>`), then `git merge --ff-only <integration>` in the checkout that has `<production>` checked out |

The setup offers this when it finds no remote. Adding a remote later changes Code host CLI to `gh`
or `glab`, and nothing else.

## Reading free memory

The sweep and the memory guard read the percentage of memory that is free:

```bash
# macOS
memory_pressure | awk -F': ' '/free percentage/ {print $2}'
# Linux
awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {printf "%d%%\n", a*100/t}' /proc/meminfo
```

On Windows, PowerShell:
`Get-CimInstance Win32_OperatingSystem | % { [int](100 * $_.FreePhysicalMemory / $_.TotalVisibleMemorySize) }`.
