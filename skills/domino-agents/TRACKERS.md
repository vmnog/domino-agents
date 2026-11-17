# The tracker

The loop needs six things from a tracker. Tracker → Tool picks the column; how to reach the tool
(the MCP connector, the CLI, the auth) is in `docs/agents/issue-tracker.md`, written by the
mattpocock-skills setup. The approver runs that setup by typing `/setup-matt-pocock-skills` in the
Claude Code message box; no agent may run it (SETUP.md → *The mattpocock-skills setup*). Linear and
Jira are recorded there through its Other option, as prose.

## The six operations

| Operation | Linear (MCP connector) | GitHub Issues (`gh`) | Jira | Local files |
|---|---|---|---|---|
| **Milestones in order**, each with its done line | `list_milestones` on the project, by sort order; `get_milestone` for the description | Milestones, ordered by a number in the title (`1 · First team`); the description is the done line. `gh api repos/<owner>/<repo>/milestones` | Fix versions, in the project's release order; the description is the done line | `.scratch/MILESTONES.md`: one `## <n> · <name>` per milestone, in order, its done line under it |
| **Open tickets of a milestone** | `list_issues` with the project, the open state types and the `projectMilestone` field | `gh issue list --milestone "<title>" --state open` | JQL `fixVersion = "<name>" AND statusCategory != Done` | Ticket files whose `Milestone:` line names it |
| **Read and comment** | `get_issue`, `list_comments`, `save_comment` | `gh issue view <n> --comments`, `gh issue comment <n> --body-file -` | Read the issue and add a comment | Append `## <heading> (<date>)` to the ticket file |
| **Blocked-by links** | `save_issue` with `blockedBy`; read back with `get_issue` and `fields: ["relations"]` (`list_issues` does not return them) | Issue dependencies ("Blocked by" in the sidebar, or `gh api` on the issue's `dependencies/blocked_by`); without them, a `Blocked by: #12, #14` line in the body | The "is blocked by" issue link | A `Blocked by:` line in the ticket file |
| **Statuses** | Workflow statuses; add `<merged-status>` as a "started" status | Labels for in progress and `<merged-status>`, created with `gh label create` when missing (SETUP.md §4.3); released = closed | Workflow statuses; add `<merged-status>` to the workflow | A `Status:` line |
| **Create a ticket in a milestone** | `save_issue` with the project and `projectMilestone` | `gh issue create --milestone "<title>"` | Create the issue with the fix version | A new file with `Milestone:` and `Status:` lines |

## Rules that hold on every tracker

- **The order is the deadline.** Milestones carry no calendar dates; the first open one is current.
  Keep a Later milestone (Tracker → Later milestone) for deferred work, so nothing sits with no
  milestone.
- **Blocked-by links are the domino's wiring.** Every ticket gets them when it is created or
  MVP-checked, and they match the `Blocked by:` line of its MVP check.
- **Two comments make a ticket settled**: `MVP check (<date>)` and `Decisions (grilled <date>)`. A
  builder refuses a ticket without the first.
- **Only the Coordinator moves a ticket past in progress.** A builder moves its ticket to in
  progress; `<merged-status>` and released are the Coordinator's, after the merge and the release.
- **New scope found mid-ticket**: search the tracker first; when nothing covers it, create a ticket
  in the milestone whose done line it serves, else Later, and name it in the report.
- Search before creating, always: parallel sessions file the same idea twice.
