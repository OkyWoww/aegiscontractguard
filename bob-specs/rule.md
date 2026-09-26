# rule.md — System Rules & Operational Guardrails

This document defines the hard constraints and operational behavior boundaries for IBM Bob and all
subagents (Alpha, Baseline Runner, Beta, Gamma) during execution of the AegisContractGuard project.

---

## 1. Boundary & File Access Rules
- **Read Access — Backend & Spec**: Agents may **read** files under `backend/` (including
  `openapi_v2.json` as the source of truth) and everything under `bob-specs/` whenever needed.
  Reading is not the same as modifying — the restrictions below only apply to writing/changing
  files, not reading.
- **Write Access — Client-Repo Only**: Agents are only permitted to **modify** files inside the
  `client/` directory. No agent (Alpha, Baseline Runner, Beta, or Gamma) may write outside this
  directory.
- **`client/tests/` vs `client/src/`**: only Beta may write inside `client/tests/` (creating
  `failing_test.ts`), and only to add that file — never to edit `baseline.test.ts`. Gamma may only
  write inside `client/src/` (implementation code) and must never modify anything under
  `client/tests/`, including `failing_test.ts` and `baseline.test.ts`.
- **Backend Read-Only**: The `backend/` directory must never be **modified**. Agents are strictly
  forbidden from changing model files, endpoints, or FastAPI server code to "fix" an error — the fix
  always happens on the client side, adapting to the backend spec, never the other way around.
- **Protected Paths**: Agents are forbidden from changing git system configuration (`.git/`),
  CI/CD configuration files, or architecture spec files (`bob-specs/`) — reading is allowed, writing
  is not.
- **Backend Server Lifecycle**: The `uvicorn` process is started **once** as a background process by
  the environment setup at the start of the session (never by any subagent), and stays alive for the
  entire session — it is not restarted per iteration by Alpha, Baseline Runner, Beta, or Gamma.

---

## 2. Execution & Gate Rules
- **Mandatory Health-Check Gate**: Running `vitest run` directly without going through the live
  server health-check gate is forbidden:
  ```bash
  wait-on http://127.0.0.1:8000/docs && vitest run
  ```
- **Terminal Isolation**: Terminal command execution must always be non-interactive
  (non-blocking). Never run a server process in the foreground in a way that blocks the task
  runner's execution.
- **Evidence Output**: Every successful verification cycle must automatically trigger the colored
  diff visualization command:
  ```bash
  git diff --color
  ```

---

## 3. Subagent Responsibility Rules
- **Alpha Rule**: Only performs static auditing between `openapi_v2.json` and the TypeScript
  interface. Forbidden from writing fix code or running test scripts.
- **Baseline Runner Rule**: Only responsible for executing the v1 test suite and capturing the raw
  error log. Forbidden from doing schema comparison or concluding the breaking-change type.
- **Beta Rule**: Only writes the failing-test reproduction file (`failing_test.ts`). Forbidden from
  modifying client implementation files (`userClient.ts` / `userTypes.ts`).
- **Gamma Rule**: Fully responsible for patch synthesis. Forbidden from editing or weakening the
  test file (`failing_test.ts`) to make the test pass artificially. Fixes must be made purely in the
  client's implementation and types.

---

## 4. Loop Termination & Rollback Rules
- **Retry Ceiling**: Gamma's fix cycle is capped at a maximum of 3 consecutive repair iterations.
- **Automated Rollback**: If the test suite is still failing (RED) on the 3rd iteration:
  1. Permanently stop the loop's execution.
  2. Revert all client file changes back to the clean state from before the loop started
     (`git checkout -- client/src/`).
  3. Produce a structured failure-diagnostics summary file (`remediation_failure.log`).
  4. Proceeding to a 4th iteration without manual intervention is forbidden.

---

## 5. Production Ethics & Safety Standard
- All AI code fixes stop at the local verification stage (tests green).
- No auto-commit or auto-push feature without a human engineer's review (Human-in-the-Loop
  principle).
