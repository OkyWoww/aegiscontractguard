# tech.md — Stack & Repo Structure

## Locked Stack
- **Backend**: FastAPI (Python) — chosen because OpenAPI JSON is auto-generated from Pydantic
  models, so the "spec" always stays in sync with the code with no extra effort.
- **Client**: TypeScript, fetch-based, typed interface — chosen because TypeScript compiler errors
  give an instant visual signal ("red" disappearing after the patch) that's easy to capture on camera.
- **Client test runner**: Vitest (locked in — lighter and starts instantly for TypeScript compared
  to Jest, important since Gamma's loop runs the test suite repeatedly in a short window).
- **Backend test mode**: A real live FastAPI server (`uvicorn`) — Beta tests genuine cross-stack
  integration (TypeScript ↔ Python), not a mock. To avoid flaky tests from a server that isn't ready
  yet, every client test script **must** be preceded by a health-check gate. Two scripts are needed
  in `client/package.json`:
  ```json
  "scripts": {
    "test": "wait-on http://127.0.0.1:8000/docs && vitest run",
    "test:baseline": "wait-on http://127.0.0.1:8000/docs && vitest run tests/client.test.ts"
  }
  ```
  `test` runs the full suite (baseline + failing.test.ts, used by Gamma's full verification).
  `test:baseline` runs only the old v1 test (used by the Baseline Test Runner task, in parallel with
  Alpha). Both packages must be recorded as `devDependencies`:
  `npm install -D wait-on vitest`.
  (Note: FastAPI's `TestClient` is a Python library and can't be called directly from Vitest/
  Node.js — the in-memory option was dropped for cross-language consistency.)
- **Dev partner**: IBM Bob — agent mode orchestrating 3 subagents + document understanding to read
  `openapi.json`.

## Suggested Repo Structure
```
aegis-contract-guard/
├── backend/                  # FastAPI, two schema versions (v1 tag, v2 on main)
│   ├── app/models.py
│   ├── app/main.py
│   └── openapi_v2.json       # SINGLE source of truth, read by Alpha — path: backend/openapi_v2.json
│                              # (never duplicated into bob-specs/ — bob-specs/ holds spec docs only,
│                              # not generated artifacts, to avoid two copies going out of sync)
├── client/
│   ├── src/
│   │   ├── userClient.ts          # Gamma's patch target — implementation only
│   │   └── userTypes.ts           # Gamma's patch target — implementation only
│   └── tests/                    # all test files live here, separate from src/
│       ├── client.test.ts      # existing v1 test — used by test:baseline (Baseline Test Runner)
│       └── failing.test.ts       # written by Beta — off-limits to Gamma (see rule.md)
├── bob-specs/                # these spec files (product/design/tech/security/skill/rule/tasks.md)
└── demo/                     # recording script, before/after screenshots, time metrics
```
Flat `client/src/` (no `api/`/`types/` subfolders) matches the actual generated boilerplate — the
`client/src/` vs `client/tests/` split is what matters for Gamma's isolation rule, not the internal
subfolder layout.
Keeping `client/src/` (implementation) and `client/tests/` (all tests) as separate top-level
directories under `client/` makes Gamma's boundary a clean directory rule — Gamma may freely edit
anything in `client/src/`, but `client/tests/` is off-limits, full stop.

## Why Not Other Stacks
- Avoided: kernel driver / eBPF (VM & live-demo crash risk — already decided against earlier).
- Avoided: gRPC/Protobuf for the first version — more complex to set up in 48 hours compared to
  REST + auto-generated OpenAPI JSON.
- Avoided: multi-client (web+mobile+service) — a single TypeScript client is enough to give Gamma a
  clear target and keep the patch reliable.
