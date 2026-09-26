# design.md — Architecture & Agent Orchestration

## High-Level Flow
```
[OpenAPI Spec v2] ──▶ Task 1: Subagent Alpha ──────────┐
   (Static Contract Drift: compare spec                │
   vs the TypeScript client interface)                 │
                                                         ├──▶ Fan-in / Merge
[Client v1 test suite] ──▶ Task 2: Baseline Test Runner ┘   (breaking_changes.json
   (Live Behavioral Check: run the v1 test suite         +  raw runtime error)
   against the real backend v2 via wait-on+vitest,             │
   runs PARALLEL to Task 1, independently)                     ▼
                                          Subagent Beta (Confirm & Formalize)
                                          — reconcile Alpha's static findings with
                                          Task 2's runtime error, compose the official
                                          failing_test.ts with specific per-field
                                          assertions (not just a generic fetch error)
                                                                     │
                                                        failing_test.ts (RED)
                                                                     │
                                                                     ▼
                                          Subagent Gamma (Patch Synthesizer)
                                                                     │
                                                        patched client code
                                                                     │
                                                                     ▼
                                          Terminal Execution Task: re-run test suite
                                                                     │
                                              PASS? ──No (iteration < 3)──▶ loop back to Gamma
                                                                     │
                                              No (iteration = 3) ──▶ rollback to clean state +
                                                                     structured diagnostic log
                                                                     │Yes
                                                                     ▼
                                          `git diff --color` (red/green visualization in terminal)
                                                                     │
                                                            Demo checkpoint: GREEN

```

## Orchestration Mode (mapped to Bob's features)
- **Document Understanding**: Alpha reads `openapi.json` (auto-generated from the Pydantic v2
  models) as a grounded spec — not LLM guesswork.
- **Parallel Tasks (the main pillar being showcased)**: Task 1 (Alpha — static drift analysis) and
  Task 2 (Baseline Test Runner — live behavioral check via the v1 test suite against backend v2) run
  **simultaneously from the first second**, with no dependency on each other — both only need
  `openapi_v2.json`/client code and the existing v1 test suite, and neither waits on the other's
  output. Results are merged (fan-in) as the single synchronization point before handing off to
  Beta. This avoids duplicated work: Alpha never has to run a test, and Task 2 never has to
  statically analyze the schema.
- **Subagents (sequential handoff after fan-in)**:
  - **Alpha — Static Contract Drift**: statically compares the new spec against the types/interface
    used by the client (no execution), producing structured output (field, old, new, severity, kind).
  - **Task 2 — Baseline Test Runner**: runs the existing v1 test suite against the real backend v2
    (via the `wait-on` + Vitest gate), capturing the real HTTP runtime error as raw proof the
    integration is broken. This is an execution task, not an analytical subagent — think of it as a
    "worker" running parallel to Alpha.
  - **Beta — Confirm & Formalize**: merges Alpha's static findings with Task 2's runtime error, then
    composes one official `failing_test.ts` with clear per-breaking-change assertions (e.g.: assert
    the `account_id` field is a string, assert the `x-api-version` header is sent) — not just a
    generic fetch error. This is the "before" evidence shown in the video.
  - **Gamma — Patch Synthesizer**: revises the client's interface and calling function to match the
    new spec, then re-triggers the test runner. This is the largest effort share (see tasks.md).
- **Terminal Execution Task**: Bob runs the test runner autonomously (not manual copy-pasted
  output), so the RED→GREEN transition happens live on screen during the demo, not simulated.

## Optional Stretch Goal — Gamma Multi-Target Healing (Parallel on the Patch Side)
If the parallel diagnostic loop above stabilizes ahead of schedule (see the hour-30 checkpoint in
tasks.md), consider a second layer of parallelism on Gamma's side as a bonus demo scene:
- **Worker 1**: fixes the type/interface definitions (`userTypes.ts`).
- **Worker 2**: adjusts the HTTP fetch call's payload parameters (`userClient.ts`).

**Mandatory guardrails if this option is used** (to avoid breaking the already-locked logic):
- Verification (`vitest run`) only runs **after both workers finish** — no partial test execution is
  allowed before both files are done changing, since `userClient.ts` depends on types from
  `userTypes.ts`.
- The 3-iteration retry cap remains **one combined count** across both workers, not 3 iterations
  per worker — otherwise the retry limit already locked in security.md/skill.md becomes meaningless.
- Status: optional/stretch, not part of the mandatory demo flow. If time is tight, just run Gamma as
  a single process as in the original design.

## Scope Boundary (deliberately narrowed for a solid 48-hour demo)
- One backend (FastAPI), one client (TypeScript, fetch-based), one endpoint.
- Two breaking changes combined into a single payload (see product.md) — not multiple endpoints.
- No auto-deploy to production; the patch stops at "local client repo, tests green" — a deliberate
  decision, explained in security.md.

## Anticipated Failure Mode
- If Gamma fails to produce a passing patch after several attempts, have a fallback ready: re-record
  with a simpler breaking-change seed (e.g. rename only, no nested object) as a backup take for the
  video.

## Operational Guardrails (preventing a stuck execution)
- **Test execution uses a live server with a strict gate, not a mock**: Beta runs Vitest against the
  real FastAPI backend (`uvicorn`) to prove genuine cross-stack integration. To prevent false
  failures from a server that isn't ready yet, test execution **must** be preceded by a health-check
  gate (`wait-on http://127.0.0.1:8000/docs`) before `vitest run` is invoked. (FastAPI's
  `TestClient` is not used because it's a Python library that Vitest/Node.js cannot access.)
- **Gamma's retries are capped at 3 iterations**: if the test is still red on the 3rd iteration, the
  system must roll the files back to a clean state and emit a structured diagnostic log (instead of
  retrying indefinitely and burning hackathon time/tokens).
- **Visual proof in the first 5 seconds**: as soon as tests pass, Gamma calls `git diff --color` in
  the terminal — the red (old code) vs green (new types) contrast is immediately visible without
  needing a long narration in the video.
