# security.md — Scope Limits & Review Gate

## Principle
AI auto-patching needs clear boundaries so it doesn't look "dangerous" or "reckless" to enterprise
judges. What's being sold is *closed-loop verification*, not *unattended auto-deploy*.

## Boundaries Enforced
- Gamma (Patch Synthesizer) only changes code in the **local/demo client repo**, never touches the
  backend, never performs a deployment, never pushes directly to a protected branch.
- Every patch Gamma produces must pass the **full test suite** (not just the new test Beta wrote)
  before being considered "PASS" — preventing hidden regressions.
- For a production version (mentioned as roadmap, not built during the hackathon): Gamma's patch
  should take the form of a **pull request** awaiting human review, not an auto-merge — this is
  framed in the submission narrative as "human-in-the-loop by design," not a limitation but a
  deliberate decision.

## Brief Threat Model (for the submission narrative, not a built feature)
- **Risk**: the AI produces a patch that passes tests but is semantically wrong (insufficient test
  coverage). Mitigation mentioned: PR review gate, minimum test coverage as a merge requirement.
- **Risk**: spec drift is detected incorrectly (false positive/negative) due to faulty OpenAPI
  parsing. Mitigation: Alpha only reports — it never triggers a patch directly without a failing
  test as proof from Beta.

## Why This Is Part of the Judging Criteria
Showing that an "autonomous agent" design still has guardrails is a plus in the eyes of
enterprise/security-conscious judges — it's not just about how autonomous it is, but how safely
autonomous it is.
