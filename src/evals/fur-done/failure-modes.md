# fur-done Failure Modes

- Closing a task without running the internal check gate.
- Moving a task to `done/` when acceptance criteria are unmet.
- Creating a progress snapshot but not updating `.fur.planning/state.json`.
- Routing successful closure to mandatory `fur-status` instead of the next executable action.
- Fabricating tracker sync when workspace config does not permit external writes.
