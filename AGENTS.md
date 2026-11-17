# domino-agents, for agents other than Claude Code

This repository is a Claude Code plugin, but every file is plain markdown that any agent can follow.

- **The Coordinator** follows [skills/domino-agents/SKILL.md](skills/domino-agents/SKILL.md). Its
  first run is [SETUP.md](skills/domino-agents/SETUP.md), which writes the project's config to
  `docs/agents/domino-agents.md`.
- **A builder** follows [skills/domino-agents/agents/domino-builder.md](skills/domino-agents/agents/domino-builder.md); **a designer**,
  [skills/domino-agents/agents/domino-designer.md](skills/domino-agents/agents/domino-designer.md); **a grill**,
  [skills/domino-agents/GRILL.md](skills/domino-agents/GRILL.md).
- **Your runtime** has no linked sessions, so you open each worktree and chat by hand:
  [RUNTIMES.md](skills/domino-agents/RUNTIMES.md) → *Another agent*.

## The pointer for your project

Add this to the project's own `AGENTS.md`, with the path where you cloned this repository:

```markdown
## Coordinator loop

Tickets run through the domino-agents loop. When asked to coordinate, take tickets, say what is
next or release, follow `<clone>/skills/domino-agents/SKILL.md` as the Coordinator. A session
started for one ticket follows the role file its brief names. The project's config is
`docs/agents/domino-agents.md`.
```
