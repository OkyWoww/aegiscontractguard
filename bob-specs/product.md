# product.md — API Contract Drift & Auto-Healing Integration Agent

## Project Name
AegisContractGuard

## Problem Statement
When an enterprise backend changes its API contract (field rename, type change, new required
field/header), service consumers (web/mobile clients or other services) don't automatically know —
causing runtime errors that are often silent and only discovered after production release. Detection
and fixing is still manual: developers have to read changelogs, hunt down every usage in client code,
and fix them one by one.

## Target User
Enterprise engineering teams with multiple services/consumers depending on a single API
(microservice or client-server architecture with backend/frontend release cycles that aren't
synchronized).

## Value Proposition
Bob acts as a "dev partner" that autonomously closes the end-to-end loop:
detect the breaking change → prove it with a failing test → rewrite the client patch →
re-verify until the test passes. Not just a passive linter/notifier.

## Why This Wins on Hackathon Criteria
- **Real, measurable problem** — API breaking changes are a universal pain point, easy for both
  technical and non-technical judges to grasp.
- **Not just a prompt wrapper** — the value is in closed-loop verification (Detect → Reproduce →
  Patch → Test Pass), using Bob's agent mode + subagents + document understanding + terminal
  execution, not a single prompt-and-answer.
- **Visual and safe for a live demo** — 100% userspace (FastAPI + TypeScript), no system/VM crash
  risk like a kernel project, with a sharp "red → green" contrast that's easy to record.

## Success Metrics (for the demo video & submission)
- Time from "breaking change shipped" to "client patched & tests green" — recorded and compared
  against an estimated manual fix time.
- Number of breaking changes handled automatically without manual intervention (target: 2 of 2
  chosen scenarios — see design.md).
- No regressions on unrelated functionality: any client behavior not tied to this breaking change
  keeps working after the patch. (`client.test.ts`, the old v1 baseline test, is expected to stay
  red after the patch — it directly asserts the removed v1 field, so it fails because of the
  breaking change itself, not because of a Gamma-introduced regression. See skill.md.)

## Core Demo Scenario
The FastAPI backend bumps version (v1 → v2) with two breaking changes at once on a single endpoint,
`/users/{user_id}`. The TypeScript client, still on the v1 contract, fails. Bob detects it,
reproduces the failure via a test, writes the patch, then re-verifies — all recorded as one
continuous take.
