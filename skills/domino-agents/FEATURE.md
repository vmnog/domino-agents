# From an idea to tickets

A feature is anything that adds something a person can newly do or see, a table, a prompt or a
glossary word. It is settled in this order: **idea → MVP check → grill → design → backend →
frontend → integration**. The Coordinator and its grill session do steps 1 to 4 with the approver;
builders and designers do the rest.

1. **A brainstorm ticket.** Search the tracker first and reuse a ticket that already covers the
   idea. Otherwise create `Brainstorm: <the idea in a person's words>`, in the milestone whose done
   line it serves, else the Later milestone.
2. **The MVP check, on the idea.** Run `mvp-challenge` before any grilling, so nothing is designed
   that should have been skipped, done by hand or reused. *Defer* or *cut* ends here until the
   approver overrides it. *Build rung N* is the scope the grill works inside.
3. **The grill** (GRILL.md). Write each answer into a decision record the moment it is given
   (`<Decision records>/<yyyy-mm-dd>-<topic>.md`): the question, the pick, the rejected options,
   the reason. One answer, one update; batched answers get lost when a session ends. Done when a builder would have nothing left to guess: every word is in the glossary
   or decided, every state a person can meet is listed, and every number has its rule.
4. **The tickets.** Split the feature into tickets one session can finish, all in the brainstorm's
   milestone, each blocked by the one it needs (the approver can run
   `/mattpocock-skills:to-tickets` for this):
   - `Explore: …` for each screen or state with no board (a designer; DESIGN.md);
   - `Backend: …` once the data shape is settled, which can start while the boards are drawn;
   - `Build: …` for the screens, blocked by the pick and by the backend.

   Show the approver the list in order before any session starts. Each ticket then enters the loop
   at SKILL.md §2.
5. **The record.** Link the decision record from the brainstorm ticket. A rule that outlives the
   feature is written into the decision records by the builder whose ticket implements it, and a
   new word into the glossary in that same ticket.
