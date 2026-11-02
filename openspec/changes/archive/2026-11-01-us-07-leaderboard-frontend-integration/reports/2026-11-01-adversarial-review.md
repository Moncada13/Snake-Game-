# Adversarial Review Report: `us-07-leaderboard-frontend-integration`

- **Date**: 2026-11-01
- **Change**: `us-07-leaderboard-frontend-integration`
- **Branch**: `feature/US-07-leaderboard-frontend-integration`
- **Verdict**: **PASS (Hardened)** — 3 edge cases identified and remediated with 100% test coverage.

---

## Findings & Remediations

| # | Severity | Category | Location | Finding | Remediation Applied |
|---|---|---|---|---|---|
| 1 | **MEDIUM** | Async Race Condition | `frontend/src/components/SnakeGame/SnakeGame.tsx` | If a player clicked `Reset` (or unmounted `SnakeGame`) while `scoreService.submitScore()` was still in flight, a late resolution would set `hasSubmitted = true` on the new game session, preventing the Score Submission Modal from opening on the subsequent Game Over. | Added a `sessionIdRef` counter incremented on `handleReset` and unmount; `handleScoreSubmit` checks `sessionIdRef.current === submitSessionId` before mutating state after `await scoreService.submitScore(...)`. |
| 2 | **LOW** | API Payload Defensive Normalization | `frontend/src/services/scoreService.ts` | `submitScore` cast `response.json()` directly to `SubmitScoreResponse`. If a proxy or unexpected response returned a 200 payload without an array `leaderboard`, `LeaderboardPanel` and `isScoreEligibleForTopFive` could throw on `leaderboard.length`. | Normalized `submitScore` return payload (`leaderboard: Array.isArray(raw.leaderboard) ? raw.leaderboard : []`, `rank: typeof raw.rank === 'number' ? raw.rank : null`, `entry: raw.entry ?? null`). |
| 3 | **LOW** | UX / Browser Autofill | `frontend/src/components/ScoreSubmissionModal/ScoreSubmissionModal.tsx` | Missing `autoComplete="off"` on `data-testid="player-name-input"` could trigger browser autofill popovers obscuring the modal. | Added `autoComplete="off"` to the player name input element. |

---

## Verification After Hardening

- `npm --prefix frontend run typecheck` → `0` errors
- `npm --prefix frontend run test:coverage` → `18/18` suites passed (`145/145` tests), **100% Statements, 100% Branches, 100% Functions, 100% Lines**

