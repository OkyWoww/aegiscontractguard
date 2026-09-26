# AegisContractGuard

**An autonomous API contract drift detector and self-healing integration agent, powered by IBM Bob.**

Built for the IBM Bob 2.0 Hackathon (lablab.ai, September 2026).

---

## The Problem

When an enterprise backend ships a breaking API change — a renamed field, a new required header —
downstream clients don't automatically know. The failure is often silent, discovered only after it
reaches production, and fixing it is manual: read the changelog, hunt down every usage in client
code, patch it by hand.

**AegisContractGuard** closes that loop autonomously. It doesn't just detect drift — it reproduces
the failure as a test, patches the client, and re-verifies until the fix is proven correct.

## What Bob Actually Does Here

This isn't a single prompt-and-answer wrapper. Bob orchestrates a full closed-loop pipeline using
four of its core capabilities:

| Capability | How it's used |
|---|---|
| **Document Understanding** | Reads the live OpenAPI spec (`backend/openapi_v2.json`) as grounded context — not guesswork |
| **Parallel Tasks** | Static contract-drift analysis and a live behavioral test run execute simultaneously, independently |
| **Subagents** | Three specialized roles (Alpha, Beta, Gamma) hand off work sequentially after a fan-in merge |
| **Terminal Execution** | Test runs, patches, and `git diff` all happen live — the RED→GREEN transition is real, not staged |

```
OpenAPI v2 spec ──▶ Alpha (static diff)   ─┐
                                            ├─▶ fan-in ─▶ Beta (writes failing test) ─▶ Gamma (patches) ─▶ tests PASS
Old test suite  ──▶ Baseline Runner (live) ┘                                              │
                                                                                    git diff --color
```

Full architecture detail: [`bob-specs/design.md`](bob-specs/design.md).

## The Demo Scenario

The backend ships a v2 API with two breaking changes at once on `GET /users/{user_id}`:

| Change | v1 | v2 |
|---|---|---|
| Response field | `id` (integer, e.g. `101`) | `account_id` (string, e.g. `"acc_101"`) |
| Request header | `x-api-version` optional | `x-api-version: 2.0` mandatory |

The v1 TypeScript client breaks against the live v2 backend. Bob detects it, proves it, fixes it,
and proves the fix — end to end, autonomously.

## Repository Structure

```
aegis-contract-guard/
├── backend/                  # FastAPI, v1 → v2 schema break
│   ├── app/models.py
│   ├── app/main.py
│   └── openapi_v2.json       # single source of truth for the v2 contract
├── client/
│   ├── src/                  # userClient.ts, userTypes.ts — Gamma's only writable area
│   └── tests/                # baseline.test.ts, failing_test.ts — off-limits to Gamma
├── bob-specs/                # full spec-driven-development documentation (see below)
├── bob_sessions/             # Bob IDE task session screenshots — evidence of real usage
└── demo/                     # video script and recording assets
```

## Specification Documents (`bob-specs/`)

This project was built spec-driven: every architectural decision was locked in writing before
implementation began.

- [`product.md`](bob-specs/product.md) — problem statement, value proposition, success metrics
- [`design.md`](bob-specs/design.md) — architecture, agent orchestration, parallel task flow
- [`tech.md`](bob-specs/tech.md) — stack decisions, repo structure, test scripts
- [`security.md`](bob-specs/security.md) — scope limits, human-in-the-loop review gate
- [`skill.md`](bob-specs/skill.md) — role and capability definition for each subagent
- [`rule.md`](bob-specs/rule.md) — hard operational guardrails (file access, retry caps, anti-gaming)
- [`execution_guide.md`](bob-specs/execution_guide.md) — the exact Bob IDE prompts used, stage by stage

## Guardrails

Autonomy with limits, by design:

- **Backend is read-only.** Bob only ever adapts the client — it never touches `backend/`.
- **Gamma cannot edit its own test.** `client/tests/` is off-limits to the patch-synthesizer subagent,
  preventing the fix from gaming its own success criteria.
- **Retry cap: 3 iterations.** If unresolved after 3 attempts, the loop rolls back
  (`git checkout -- client/src/`) and emits a structured `remediation_failure.log` instead of
  retrying indefinitely.
- **No auto-merge.** Every fix stops at local verification (tests green). Shipping to production
  requires a human-reviewed pull request.

Full detail: [`bob-specs/security.md`](bob-specs/security.md) and [`bob-specs/rule.md`](bob-specs/rule.md).

## Running Locally

**Backend**
```bash
cd backend
uvicorn app.main:app --reload
```
Confirm it's up: `curl -s http://127.0.0.1:8000/docs`

**Client**
```bash
cd client
npm install
npm run test:baseline   # proves the v1 client fails against the live v2 backend
npm test                # full suite, once Gamma's patch is applied
```

## Evidence of Bob Usage

Every Bob IDE task in this build has a corresponding session-summary screenshot in
[`bob_sessions/`](bob_sessions/), captured immediately after each task completed:

- `aegis_task01_diagnostic_summary.png` — Alpha + Baseline Test Runner (parallel diagnostic)
- `aegis_task02_beta_summary.png` — Beta (failing test synthesis)
- `aegis_task03_gamma_summary.png` — Gamma (autonomous patch + verification)

## Demo Video

[Link to be added at submission]

---

Built solo for the IBM Bob 2.0 Hackathon by Oky.
