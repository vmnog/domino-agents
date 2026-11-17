---
name: mvp-challenge
description: Challenge a priority call before any work starts — test it against the current milestone's done line, climb the cheapest-path ladder to the least work that gives the milestone's people the same value, and run a cold devil's-advocate pass. Use when the user picks, adds, drops or reorders a ticket, reverses a decision, asks "should we build X", when you are about to propose new scope, or when the domino-agents Coordinator takes a ticket.
---

# mvp-challenge

The approver asked for a second opinion, not a yes. Agreement is earned by evidence. When the
evidence points away from their call, say so in the first line of the answer.

One run per call. A call is one ticket, or one change of plan ("move the logs to Later"). The
project's config is `docs/agents/domino-agents.md`; the tracker calls are in the domino-agents
skill's TRACKERS.md.

## The two sizes

- **Quick**, for a fix to something already there: a bug, a wording, a state that reads wrong.
  Do steps 1 and 2, skip step 3, and record four lines (step 4).
- **Full**, for anything that adds a screen, a table, a prompt or a glossary word, or that
  reverses a decision, and for any call the approver asks to have challenged. All four steps.

A call that could be either is full. A check that is skipped once gets skipped every time, so even
a one-line fix gets its four lines.

## 1. Name the value

1. **Find the milestone; never assume one.** It is the milestone of the call's ticket, or the one
   the call names. With neither, it is **the current milestone**: the first in order whose
   description does not say Done and whose progress is under 100%. Several can run at once, so
   check every time, and say which one you picked and why in one line. Read its description.
2. Quote the clause of the done line that the call serves, word for word.
3. Write the **value** in one sentence: what the people that milestone serves can do or see
   afterwards that they could not before. The done line names those people.
4. Name what those people are actually blocked on today (a ticket, content, a reply). A call that
   does not touch it competes with it.

The evidence is never "no partner has tried it yet": Project → Partners get visibility, and the
approver alone tests and decides.

Done when you have the clause and the value sentence, or one of these outcomes:

- **Outside**: no clause names it. The verdict starts at *defer*.
- **Contradicts**: the call drops something a clause promises. Name the clause and draft the
  milestone-text edit that would make the call honest. The approver decides between the edit and
  the call.
- **Out of order**: the call's milestone is not the current one. Milestones carry no calendar
  dates, so their order is the deadline. The verdict starts at *defer*, and building it now needs
  the approver's explicit yes.

## 2. Climb the cheapest-path ladder

Climb from the top and stop at the first rung that delivers **the same value** to the people the
milestone serves:

1. **Skip.** Nobody it serves would notice it missing in their first month.
2. **A human does it.** A message to a colleague, a script, a row in the database, a doc. A load
   script beats a screen that nobody but the team will open. When the fix is a conversation two
   people already have, an app control for it is never just a button: it is an endpoint, its
   abuse limits and its own failure states.
3. **Reuse.** A screen, route or flow that already ships carries it with a small change. Grep the
   real routes, screens, migrations and decision records before saying something needs building.
   Between two close designs, the one that reuses existing machinery wins: a second mechanism
   doubles what can break.
4. **Fake it.** The person sees the result, and the work behind it is manual or fixed.
5. **The smallest build.** One state, one path, no settings, no second case.
6. **The ticket as written.**

Write one line per rung you tested, down to the one you stopped at: what it adds (sessions to build
it, a migration, a screen and its boards, a prompt, a row for the approver to test) and what it
gives up. Size a rung in those, never in hours or weeks: parallel sessions build fast, and what
runs out is the approver's time to review and test. Code nobody consumes yet is the expensive kind
of wrong: it gets reviewed, tested and documented, then constrains the real design when it arrives.

Done when one rung is named as the cheapest that holds the value. A rung that gives up the value
does not count, however cheap it is. When Project → Rebuild of names an old app, *skip* and
*defer* are off the table for a screen that app already ships: a missing read gets its own ticket.

## 3. The cold attack (full size only)

Dispatch one general-purpose subagent in the foreground. Give it the prompt in
[ADVOCATE.md](ADVOCATE.md), filled in with the milestone text, the call, the value sentence and the
ladder result. It has not seen this conversation, so it cannot inherit your agreement.

Done when it returns its kill shot, its three attacks, its cheaper alternative and its probability.
Answer each attack in one line, with evidence or a concession.

## 4. The verdict

Pick one: **build as written**, **build rung N**, **defer** (to the Later milestone), or **cut**.

**Every check names the ticket's blockers**, so the domino knows when it can start: a line
`Blocked by: <ids>` (each ticket whose merged code, data shape or picked boards it needs first, or
whose files it touches) or `Blocked by: none`. Set the same links in the tracker. The cheapest rung
can move a blocker: a ticket that reuses shipped code often needs nothing first, so check the links
again after step 2.

**Every check ends as a comment on the ticket headed `MVP check (<date>)`.** A builder refuses a
ticket without one.

- **Quick**: four lines under that heading: the clause, the cheapest rung that holds, the verdict,
  and `Blocked by`. It goes to the approver only when the verdict is not *build as written*.
- **Full**: answer the approver in this shape, then record the clause, the rung, `Blocked by` and
  their pick.
  - One line: the call, the clause, the verdict. When the verdict differs from their call, write
    "I'd do X instead, because Y."
  - The advocate's kill shot in one line, and whether it survived.
  - At most three numbered options, the recommended one first and marked (Recommended), each a few
    words plus what it adds, and an answer line.

Done when the comment is on the ticket. A call that changes the plan and not one ticket is recorded
where the plan lives: the ticket moved to its milestone, or the milestone text edited.
