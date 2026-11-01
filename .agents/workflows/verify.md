---
description: "Verify implementation matches the OpenSpec change artifacts (alias of /opsx-verify)"
---

Alias for the official OpenSpec verify workflow.

1. Read and follow `.agents/workflows/opsx-verify.md` exactly (skill: `.agents/skills/openspec-verify-change/SKILL.md`), passing the user's input as the change name.
2. Additionally enforce `docs/openspec-tasks-mandatory-steps.md`: confirm mandatory steps (feature branch, unit tests, curl tests, E2E tests if applicable, documentation updates) were executed by the agent and that their reports exist in the change folder.

