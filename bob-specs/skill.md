# skill.md — Roles & Capabilities of Each Subagent

Note: this defines roles/capabilities (for Bob's per-subagent system prompt), not code.
Technical implementation follows during the build, within the boundaries set in design.md and
security.md. Hard rules (file access, execution gates, retry ceiling, ban on gaming the test) live
in `rule.md` — this document explains *what* each subagent's job is, `rule.md` explains the *hard
limits* nobody is allowed to cross.

## Subagent Alpha — Static Contract Drift
**Role**: Static spec auditor, not a fixer. Runs **in parallel** with the Baseline Test Runner task
(see design.md), does not wait on or depend on it.
**Input**: latest OpenAPI spec (`openapi_v2.json`) + the TypeScript client source.
**Required capabilities**: reading and parsing the OpenAPI schema, understanding the equivalent
TypeScript types, identifying three classes of breaking change: field rename, type/structure change,
new required field/header.
**Output**: a structured report listing breaking changes and their severity.
**Constraints**: does not write or suggest fix code — purely static detection & classification, and
does not run any tests (that's the parallel Baseline Test Runner's job).

## Parallel Task — Baseline Test Runner (Live Behavioral Check)
**Role**: Execution worker, not an analytical subagent. Runs **in parallel** with Alpha,
independently.
**Input**: the existing v1 test suite + the live backend v2 (`uvicorn`).
**Required capabilities**: running the old test suite via the gate
`wait-on http://127.0.0.1:8000/docs && vitest run` against backend v2, capturing the real HTTP
runtime error (raw proof that the integration is actually broken).
**Output**: raw runtime failure log, forwarded to the fan-in merge alongside Alpha's report.
**Constraints**: does not statically analyze the schema (that's Alpha's job) — just run it and
capture the result as-is.

## Subagent Beta — Confirm & Formalize (formerly: Contract Test Reproducer)
**Role**: Synthesizer, turning the two parallel findings (Alpha + Baseline Test Runner) into one
official, runnable piece of evidence that's easy for a non-technical audience to read on video.
**Input**: Alpha's report (fan-in) + the runtime log from the Baseline Test Runner (fan-in). Beta
only starts work **after** both parallel tasks finish (the single synchronization point in the
diagnostic stage).
**Required capabilities**: reconciling Alpha's static findings with the raw runtime error, then
writing the official `failing_test.ts` with specific per-breaking-change assertions (e.g.: assert
`account_id` is a string, assert the `x-api-version` header is sent) — not just a generic fetch
error. Running that test (Vitest) via the gate `wait-on http://127.0.0.1:8000/docs && vitest run` to
confirm it truly FAILS with a clear message.
**Output**: a failing test file (RED) with a failure log that's easy for a non-technical audience to
read on video.
**Constraints**: does not modify client code — only writes a new test based on findings already
confirmed from both parallel sources.

## Subagent Gamma — Patch Synthesizer (largest effort focus)
**Role**: An autonomous partner that sees the problem through to completion.
**Input**: Alpha's report + Beta's failing test.
**Required capabilities**: revising the client's interface/types and calling logic to match the new
spec, re-triggering test execution via the terminal execution task, repeating the revision cycle
until the full test suite (old + new) passes — **capped at 3 iterations**. If the 3rd iteration still
fails, must roll back (`git checkout -- client/src/`) to the clean state from before the loop
started, and produce a structured diagnostic summary file, `remediation_failure.log` (not an
unbounded retry or a generic "diagnostic log"). Once tests pass, run `git diff --color` in the
terminal as visual before/after proof.
**Output**: updated client code + proof of a PASSing test run + `git diff --color` output.
**Constraints**: does not touch backend code; does not auto-commit/push to the main branch (see
security.md — human-in-the-loop by design for a production version). **Strictly forbidden from
editing or weakening `failing_test.ts`** (changing/removing assertions) to make the test pass
artificially — the fix must be made purely on the client's implementation and types, never on the
test side.

## "Done" Criteria per Subagent
Consistent with the working standard already used on other projects: every subagent is only
considered done when backed by real execution evidence (test runner output, code diff) — not a
narrative claim.
