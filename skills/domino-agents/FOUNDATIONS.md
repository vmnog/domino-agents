# Design foundations: the brief and the system, before any exploration

Many projects start with no design system: no brand, no tokens, no drawn primitives. A designer
that explores a screen there invents a colour, a font and a radius for that one screen, and the
next designer invents different ones. Every later screen then gets redesigned to match.

So the loop defines the foundations **once, first**, and every exploration after that reuses them.
The approach is adapted from the `craft-setup` and `craft-system` skills of
[diego3g/craft](https://github.com/diego3g/craft).

**Ask, don't invent.** A brand the agent made up is a guess the approver has to undo later. Colours,
fonts and mood come from the approver or from what the project already has. Anything the agent
proposes on its own is marked `(assumed)` until the approver confirms it.

## When it runs

| The project has | What happens |
|---|---|
| No screens (a CLI, an API, a library) | Nothing. Design → Brief and the rest say `none`. |
| Screens, a brief (Design → Brief) and foundations drawn and in code | Nothing. Explorations reuse them. |
| Screens, and no brief or no foundations | A **Design foundations** ticket, first in the current milestone. Every ticket that changes what a person sees is blocked by it. |
| A design system in code (a token file, a theme, a component library) but none drawn, or no brief | The same ticket, in **import** mode: the foundations are drawn from the code, never invented again. Only the brief's gaps are asked. |

SETUP.md creates the ticket on the first run (step 4.3). The design gate (SKILL.md §4) creates it
later when it finds a visible ticket and no foundations: a project set up before this file existed,
or one whose first screen comes later than its setup.

**While the foundations ticket is not merged, no designer explores a screen.** The grill sessions
of visible tickets still run: their decisions are about behaviour and words, not looks.

The foundations ticket is a normal ticket of the loop. Its MVP check is quick (it serves every
visible clause of the milestone), its grill is the brief interview below, a designer draws the
foundations, and a builder puts them in code. The approver OKs each step like any other.

## 1. Read first (the grill session)

Before the first question, read what already answers one, and confirm those in one line instead of
asking:

- the README, the docs, `CLAUDE.md`, an existing `DESIGN.md` or brand guide;
- the code's design system: a token file (`tokens.css`, `theme.ts`, `tailwind.config.*`, CSS
  variables in a global stylesheet), a UI package or component library, a font setup, an icon
  package. Count what is there ("42 colour variables, 9 components, Lucide icons"). With two
  candidates, ask which one is the source;
- brand folders: logos, favicons, app icons, fonts, screenshots of an older app (Project → Rebuild
  of);
- the design file (Design → File), and its foundations page if one exists.

## 2. The brief interview (the grill)

The grill session runs these as its questions (GRILL.md → *The grill*: numbered options, the
recommended one first, an answer line). Skip every question step 1 already answered. Stop as soon as
the first screen could be designed without guessing: six good answers beat fifteen.

| # | Ask about | Why it comes first |
|---|---|---|
| 1 | **Product**: what it is, who uses it and on what device, and the one job of the most-used screen | Device and main job set density and layout before anything else |
| 2 | **Audience and voice**: how technical, how formal, the language, and the formats for dates, money and times | Copy and number formats appear on every screen |
| 3 | **Mood**: two or three words, and what it must **never** look like | "Never like" rules out whole directions in one answer |
| 4 | **Brand**: the logo, colours, fonts, an existing style guide, a design file or tokens | Read what exists; ask only about the gaps. Always offer "Nothing yet: propose some, marked (assumed)" |
| 5 | **References**: two to five products, sites or images. For each, what to take and what to avoid | Required. Open each link or image and describe it before asking. With none, offer three that fit the mood, found on Mobbin when Design → External references says `mobbin` (DESIGN.md) |
| 6 | **Constraints**: platforms, accessibility level, light and/or dark, the icon set, how much motion | Each one removes options from every later board |

**The approver says "skip"** (or "just design it"): no interview. The brief is written from what
step 1 found, every gap goes under *Open questions*, every guess is marked `(assumed)`, and the
three most important assumptions are named in one line. Skipping waives the interview, never the
foundations: the designer still draws them and the approver still OKs them.

The decisions comment holds the answers, as for any grill. The grill changes no file.

## 3. The brief and the foundations (the designer)

The designer session for the foundations ticket follows `agents/domino-designer.md`, with these
two outputs instead of screen options.

### The brief

The text of Design → Brief (`DESIGN.md` at the project root unless the config says otherwise),
written from the decisions comment in the approver's own words. Post it as a ticket comment headed
`Design brief (draft)`; the builder commits it. Eight sections:

```markdown
# Design brief

> If this file and the code disagree, the code wins until the approver decides.

## Product
## Audience and voice
## Mood            (including "never looks like")
## Brand           (logo, colours, fonts, each confirmed or marked (assumed))
## References      (each with take / avoid)
## Constraints
## Decisions log   (- <yyyy-mm-dd> — <decision> — <why>)
## Open questions
```

Anything inferred and not confirmed goes under *Open questions*, never as fact.

### The foundations

Drawn on the foundations page (Design → Foundations page), or, with Design → Tool none, as one
specimen page in code. What they hold:

- **Colour, by role**, never by value: name a token for its job (`text-muted`, `border-hover`,
  `danger-bg`), not its shade (`gray-500`). The roles to cover:
  - text: `text`, `text-muted`, `text-placeholder` (lighter than muted), `text-disabled`, and
    `on-primary` for text on a filled colour;
  - grounds: `surface`, then `fill-1` and `fill-2` (a third grey ground is a smell);
  - lines: `border`, `border-hover`, `divider` (lighter than border);
  - overlays for borderless pieces: `tint-hover`, `tint-selected`, `tint-pressed`;
  - action: `primary`, `primary-hover`, `primary-pressed`, `focus`;
  - feedback: `success`, `warning`, `danger`, each with a background, a text and a strong shade;
  - `overlay` behind dialogs, and the shadow colours.
  With light and dark both in Constraints, every role has both values.
- **Type**: the families (with their licence and how the app loads them) and a scale of sizes with
  paired line heights, named by use (`caption`, `small`, `body`, `title`, `display`).
- **Spacing** on a base (4 px is the default), listing only the steps the boards use.
- **Radius**: three to five steps plus `full`.
- **Shadows**: two at most, used only on things that float (menus, popovers, dialogs, toasts).
- **Layout**: content width, sidebar and panel widths, the breakpoints for Evidence → Viewport.
- **Motion**: three durations (about 150, 250 and 350 ms), one easing for most things, opening
  slower than closing; none at all when Constraints asks for no motion.
- **Interaction rules**, written once for every bordered piece, borderless piece and primary
  action: how normal, hover, pressed, focus (keyboard only), disabled, loading and selected look.
  The defaults, unless the brief or an existing guide says otherwise: hover is subtler than
  selected; selecting never changes the font weight; loading keeps the exact size; at most one
  primary action per screen.
- **Brand assets**: the logo in each variant the app needs (full, mark, on dark, favicon, app
  icon), the font files or their source, and **one icon set** (Design → Icon set). Real files from
  the approver, or proposals marked `(assumed)`. Never a hand-drawn logo or icon.
- **The first primitives**: button, input and card at least, each with its states drawn, so the
  first exploration has pieces to reuse.

**One draft, or a few directions.** When the brand is given (or imported from code), draw one
draft. When Brand was answered "nothing yet", draw two or three directions as a row on
`<explorations>`, each one specimen board (palette, type, a button, an input and a card) that
differs in mood a person sees at a glance, with a note card under each. The approver picks one;
the pick moves to the foundations page and the rest of the row is deleted, as for any exploration
(DESIGN.md → *Exploring*).

**Import mode** draws what the code already has, token by token and primitive by primitive, with
the code's own names. It invents nothing and renames nothing: a gap or a clash goes in the report
as a question with numbered options.

## 4. Into the code (the builder)

The builder for the foundations ticket commits, in one change:

- the brief at Design → Brief, from the approved draft;
- the tokens in Design → Tokens file, with the names on the foundations page (in import mode,
  only the tokens that were missing);
- the fonts loaded, the icon set installed, the brand assets in Design → Brand assets;
- the primitives, from Design → Components from where it names a library;
- a specimen screen or story that shows every token and primitive. It is the evidence, and it
  stays as the place to check that the code and the foundations page agree.

Then the config fields that said `set by <this ticket>` get their real values in the same change.
The merge runs the domino: every visible ticket it blocked can now be explored.

## 5. After the foundations

- **Every exploration reuses them.** Options differ in layout, hierarchy and flow, never in brand:
  a colour, a theme or a font is never what one option tries and another does not. Only the
  foundations' tokens and primitives appear on a board.
- **No one-off values.** A screen that seems to need a new colour, size, radius or icon gets it as a
  token, a primitive variant or an icon-set entry first: drawn on the foundations page and named
  for its role, then used. "This screen needs a slightly different card" means a variant of the
  card, or the card.
- **A change to a shared piece** lists every screen and board that uses it before it changes, and
  the approver OKs that list.
- **The brief grows.** Each decision about the look is appended to its *Decisions log*, and an
  answered open question moves out of *Open questions*, in the ticket that decided it.
