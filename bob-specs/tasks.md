# tasks.md — 48-Hour Execution Breakdown

## Tonight (Before Kickoff) — Mandatory, Not Optional
- [ ] Confirm official lablab.ai registration is submitted — **closes Thursday Sept 24, 22:00 CEST /
  16:00 ET**. This is the top priority above any other technical prep.
- [ ] Create an IBMid (using the same email as the registration).
- [ ] Install Bob IDE, check the version — if still on v1.0.3 or v2.0.0, upgrade to v2.0.x/v2.0.2+
  (old versions stop working September 30).
- [ ] Read the official IBM Bob 2.0 Hackathon Guide (setup, best practices, hands-on exercises).
- [ ] Tomorrow morning: check for the `ibm-hackathon-xxxx` invite email (including the spam folder),
  then **switch accounts** to the hackathon account (`ibm-codingchallenge-uat`, region us-east) in
  Bob IDE Settings before spending any Bobcoins — to avoid accidentally using personal Bobcoins.

## Tonight — 40-Bobcoin Budget (spend checkpoints)
| Stage | Max Coins | Notes |
|---|---|---|
| Setup & context (feed bob-specs/) | 2 | Zero-chat prompting, reference files directly |
| Alpha (static drift) | 5 | Target: 1 execution prompt |
| Baseline Test Runner | 3 | Pure terminal execution |
| Beta (confirm & formalize) | 6 | Synthesis from 2 sources |
| Gamma (patch, max 3 iterations) | 15 | Largest share — don't cut this |
| Verification + `git diff --color` | 3 | |
| Emergency buffer | 6 | Includes re-taking a screenshot if needed |
Monitor remaining coins in Bob IDE → Settings → General after each stage, not at the end.

## Hour 0–4 — Setup & Grounding
- Initialize the repo per the structure in tech.md.
- Build the FastAPI backend v1 (initial state) and v2 (breaking change), separate git tags.
- Confirm `uvicorn` can be run as a local live server for backend v2.
- Build the TypeScript client v1, set up Vitest (locked in, not Jest), and configure the test script
  with the gate `wait-on http://127.0.0.1:8000/docs && vitest run` (not a mock/Python TestClient).
  Make sure `wait-on` and `vitest` are in `devDependencies` in `client/package.json`:
  `npm install -D wait-on vitest`.
- Generate `openapi_v2.json` from v2, confirm it's valid.
- Feed all these spec files (product/design/tech/security/skill.md) to Bob as initial context.

## Hour 4–14 — Build Alpha (parallel) + Baseline Test Runner (parallel) + Beta
- Implement Alpha per skill.md (static drift analysis), test with the known breaking changes (must
  detect both: rename+type change, and the new required field). Run this **without waiting** for the
  next task.
- Implement the Baseline Test Runner: run the existing v1 test suite against backend v2 via the
  `wait-on` + Vitest gate, confirm it captures the real runtime error. Run this **in parallel** with
  Alpha (the two tasks are independent — explicitly verify they can genuinely run at the same time
  without waiting on each other; this is concrete proof of Parallel Tasks usage for the submission).
- Implement a simple fan-in/merge step combining Alpha's and the Baseline Test Runner's output.
- Implement Beta: only starts after the fan-in is done, composes the official `failing.test.ts` with
  specific per-breaking-change assertions (not a generic fetch error), runs it via the `wait-on` +
  Vitest gate, confirms it truly FAILS with a clear message.
- Checkpoint at hour 14: proof that Alpha + Baseline Test Runner ran in parallel (timestamps/logs
  showing overlap, not sequential execution) → fan-in → Beta's official failing test saved.
- **Mandatory before moving on**: screenshot the session summary for each task (Alpha, Baseline
  Runner, Beta) from the Bob IDE Tasks panel — click the task header, screenshot it, save to
  `bob_sessions/` with a clear name (e.g. `aegiscontractguard_task01_alpha_drift_summary.png`). Do
  this **immediately after each task finishes**, don't wait until the next task closes this session.

## Hour 14–30 — Build Subagent Gamma (largest time share)
- Implement Gamma per skill.md, including the 3-iteration retry cap + rollback & diagnostic log if
  the 3rd iteration still fails.
- Test the revision loop: patch → re-run test → if still failing, revise again → repeat until PASS
  (or until the 3-iteration limit is hit — also verify the rollback path works).
- Confirm `failing.test.ts` reaches GREEN. `client.test.ts` is expected to remain RED — that's
  correct, not a regression (see skill.md's note on Gamma).
- Add the automatic `git diff --color` call once tests go green.
- Checkpoint at hour 30: the Detect→Reproduce→Patch→Pass loop validated end-to-end at least once in
  full, including clean `git diff --color` output ready to record.
- **Mandatory before moving on**: screenshot Gamma's task session summary from the Bob IDE Tasks
  panel, save to `bob_sessions/` (e.g. `aegiscontractguard_task02_gamma_patch_summary.png`).

## Hour 30–36 — Hardening & Fallback
- Re-test from a clean state (reset client to v1) several times to confirm the loop is consistent,
  not a one-off fluke.
- Prepare the fallback scenario per design.md (a simpler breaking change) in case the full loop
  isn't stable enough to record.
- **Optional (only if ahead of schedule)**: attempt the Gamma Multi-Target Healing stretch goal
  (Worker 1: `userTypes.ts`, Worker 2: `userClient.ts`) per design.md, with mandatory guardrails:
  verification only runs after both workers finish, and the 3-iteration retry cap stays one combined
  count. If it doesn't stabilize in time, abandon it and stick with the single-process Gamma — don't
  sacrifice the proven main loop for this bonus feature.
- Record the time metric (Detect→Pass) for use in product.md's success metrics.

## Hour 36–42 — Demo Recording
- Record one continuous take: initial state (client v1, old tests green) → backend bumps to v2 →
  the autonomous loop runs → tests go green → show the patch diff & time metric.
- Take before/after screenshots of the TypeScript compiler error as extra visual proof.

## Hour 42–48 — Submission
- Confirm you have all **three official deliverables** (per the kickoff livestream, not just the
  earlier flyer):
  1. **Product description** — written summary using the points from product.md (problem, value
     prop, metrics).
  2. **Presentation** — the recorded demo video, **hard limit 5:00** (target 4:00–4:45), per
     demo/video_script.md.
  3. **GitHub link** — public repo containing the implementation, `bob-specs/`, and a complete
     `bob_sessions/` folder.
- Set up the public repo + README referencing bob-specs/ as evidence of the SDD process.
- Confirm the `bob_sessions/` folder in the final repo has a screenshot for **every** Bob task
  (Alpha, Baseline Runner, Beta, Gamma) — this is an eligibility requirement, double-check nothing
  was missed.
- Submit before the deadline, leaving at least a 1-hour buffer for submission technical issues.
