# The design file

The design file (Design → File) is where the approver reviews and decides how things look. A board
that lags the app makes them decide against a design that no longer exists, so the file and the
code move together, in the same ticket.

## What each page is for

The names are the config's (Design section). A page set to none is skipped.

| Page | Holds | A board arrives when | A board leaves when |
|---|---|---|---|
| Flow pages | The board of record: every screen and state the approver has OK'd as drawn, one page per flow, boards in labelled rows, named as Design → Board names says | The approver OKs it as drawn on `<explorations>` (or in a builder's evidence), and it moves here | Its screen is retired: it moves to the archive page |
| Foundations page | The design system as drawn: colour, type, spacing, radius, elevation, motion, interaction rules, primitives, brand assets, icons. Defined once, first (FOUNDATIONS.md) | The foundations ticket draws it; later, a token or a primitive is added | Its token or primitive is removed |
| Proposed page | Screens nobody has decided to build, each named `… — PROPOSED` | An idea is worth keeping in sight | Its screen ships or is cut: delete it, the flow page draws what shipped |
| `<explorations>` | **Every board the approver has not yet OK'd as drawn**: options to pick from, and also a single new board whose layout a grill chose in words. One labelled row per decision | A designer or a builder draws a new board | The approver OKs it: the winners move to the flow page and the rest of the row is deleted |
| Archive page | Boards no longer in use | A screen is retired | |

**An empty `<explorations>` is the normal state.** A row still there is a decision still open.

**Every new board starts on `<explorations>`**, a single board as well as a set of options.
"Picked in words" in a grill is not "OK'd as drawn": boards drawn straight onto a flow page read as
settled before the approver has seen them. Only one thing is drawn in place on a flow page: an
existing, OK'd board redrawn to match words or behaviour already decided (a wording fix, a state
that ships as decided).

## Exploring

**Explorations start from the foundations** ([FOUNDATIONS.md](FOUNDATIONS.md)). With no brief or no
foundations yet, the foundations ticket comes first and nothing else is explored.

- **Options differ in design, not in brand.** Layout, hierarchy, density and flow are what one
  option tries and another does not. A colour, a theme or a font never is: those were decided once
  on the foundations page.
- Only the foundations' tokens, primitives and icon set appear on a board. A value the foundations
  lack becomes a token or a primitive variant first, drawn on the foundations page and named for
  its role, then used. Never a one-off value on one board.
- One designer session per decision, and one row per session, labelled
  `Row — <what is being decided> (<ticket-id>)`. A session touches its own row only; other sessions
  work on the same page.
- Boards are Design → Board width wide, named `Screen / state — option A`. Options differ in a way
  a person sees at a glance; options that look alike waste the approver's pick.
- Under each option sits a note card, as wide as the board, in a warning colour, titled like
  `Q1 · pick 2`, with one or two plain sentences on how it differs. A board that is an edge case
  and not a choice gets a grey card reading "Not a choice".
- **Nothing leaves its frame.** Measure every text node and row against the board's width with the
  tool's own numbers, not by eye on a screenshot, and give long text a wrap or a truncation. Check
  the longest-text board again at the narrowest width the app supports (320 px for a phone).
- The approver gets the link to the page, the row label, each board's exact name left to right, the
  PNGs, and the decision as numbered options with the recommended one first.
- After their pick, the designer moves the chosen boards to their flow page, then deletes the rest
  of its row: the other options, every note, the row label, and its exported PNGs by exact path.
  It deletes nothing else on the page.

## Keeping the design in sync

Every ticket that changes something a person sees changes its twin in the design file in the same
ticket:

| The change in code | Its twin in the design file |
|---|---|
| A screen or state looks or reads differently (already decided) | Its board on the flow page, redrawn in place |
| A new state (empty, failed, long text) | A new board on `<explorations>`, moved to its flow page after the approver OKs the evidence, before the PR |
| A screen or state is removed | Its board moves to the archive page |
| A screen that had a `… — PROPOSED` board ships | That board on the proposed page is deleted |
| A token is added, renamed or revalued in Design → Tokens file | The same token in the design file, and its swatch on the foundations page |
| A primitive or a variant is added | Its drawing on the foundations page |

The code side has the gate. **The design file has no checker, so the Coordinator is the check**: a
builder's report names every board it changed, and "design unchanged" is accepted only when no
board draws the changed thing. A builder that skips the design file goes back, or a designer
redraws the boards.

## Boards and code agree

- **Every element on a picked board ships.** An element whose backend is missing is drawn and
  shows a "not built yet" alert when tapped. Board sizes round to the nearest token; a new token
  only when the nearest looks visibly different.
- **Icons are copied path data**, from the code's icon set or the project's icon library, never
  drawn by hand. Nothing checks the design file, and builders copy what the board shows.
- **Tokens are named for what they do**, not for their first use; grep the primitives for the noun
  first.
- Older boards lag the code. Read the screen's code before copying a board, and fix a drifted
  board in the same pass.

## Notes per tool

- **Paper** (the `paper` MCP, from the `paper-design/agent-plugins` marketplace). Call
  `get_guide({ topic: "paper-mcp-instructions" })` once per session, then `get_basic_info`; call
  `get_font_family_info` before the first text styling and `finish_working_on_nodes` when done.
  Each of these cost a round trip once:
  - Export PNGs from `get_screenshot`: Paper's `export` writes into the Downloads folder.
  - `currentColor` is not resolved in SVG, so an icon comes out black: put the colour on each
    shape.
  - A page nobody has looked at has no sizes yet: judge by `get_screenshot` first, and measure for
    overflow at the end.
  - An `<img>` becomes a background fill that ignores `object-position`: set `backgroundPosition`,
    or use a picture already cut to the frame.
  - Paper keeps a local picture by its path: save a changed picture under a new file name.
  - A long board from a prototype is fastest as one spec file per section (measured in a browser)
    and one agent per section.
- **Figma** (Figma's MCP server). When the MCP cannot write boards, the designer builds the
  variants in code behind a picker, and the approver places the picked board in Figma by hand.
- **Pencil** (`.pen` files, the `pencil` MCP). Read and write only through its tools.
- **No design tool.** `<explorations>` is a folder in the designer's worktree. Each option is a
  code variant behind a picker (the `prototype` skill) plus a screenshot at Design → Board width,
  named like a board. The "flow page" is the merged code itself, so the gate checks that the
  builder's evidence shows every state.
- **The tool is not reachable.** Say so in the report, and put the variants in code only.
