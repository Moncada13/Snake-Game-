---
description: "Analyze and enrich a user story into an implementation-ready ticket (Specboot)"
---

Enrich the user story / ticket provided as input (for example `/enrich-us US/US-01-game-board-and-ui-layout.md`, a Jira key, or raw ticket text).

1. Read and follow the canonical skill at `ai-specs/skills/enrich-us/SKILL.md` exactly. Treat the user's input as `$ARGUMENTS`.
2. Apply the project technical context from `docs/base-standards.md` and the relevant standards it links (`docs/backend-standards.md`, `docs/frontend-standards.md`, `docs/api-spec.yml`, `docs/data-model.md`).
3. If the input is a file path (for example under `US/`), read that file as the ticket content and, after producing the `## Original` / `## Enhanced` output, ask whether to write the enhanced version back to the same file.
4. If no input is given, ask the user which story to enrich (list the files in `US/` as options).

