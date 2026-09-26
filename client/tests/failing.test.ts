/**
 * AegisContractGuard — Subagent Beta: Official Contract Drift Failing Test
 *
 * Purpose: Formally reproduce every breaking change identified by Subagent Alpha
 * and confirmed live by the Baseline Test Runner. Each assertion calls the
 * UNPATCHED v1 client (userClient.ts / userTypes.ts) and asserts the v2 contract
 * requirements — so the test MUST be RED until Gamma patches the client.
 *
 * Breaking changes under test:
 *   BC-1  MANDATORY_HEADER   — GET /users/{user_id} must send x-api-version: "2.0"
 *   BC-2  MANDATORY_HEADER   — POST /users must send x-api-version: "2.0"
 *   BC-3  FIELD_RENAME       — Response field `id` (number) renamed to `account_id` (string)
 *   BC-4  NEW_REQUIRED_FIELD — `account_id` is now a required string in the UserV2 schema
 *
 * Rule compliance (rule.md):
 *   - Beta only: creates this file inside client/tests/ — never modifies client/src/.
 *   - Does not alter baseline.test.ts or client.test.ts.
 *   - Does not apply any fix to the client implementation.
 *   - Assertions must NOT be weakened to make the test pass artificially (rule.md §3).
 */

import { describe, it, expect } from "vitest";
import { fetchUserProfile, createUser } from "../src/userClient";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

describe("AegisContractGuard — Beta: Contract Drift v2 Assertions (RED against v1 client)", () => {
  // BC-1 ——————————————————————————————————————————————————————————————————————
  // The v1 fetchUserProfile omits x-api-version. The v2 backend rejects it with
  // HTTP 400. This test asserts the returned user object has account_id as a
  // string — it will never reach that assertion because the client throws first,
  // producing a clear failure message naming the missing header.
  it("BC-1 + BC-3 + BC-4: fetchUserProfile must send x-api-version: '2.0' and receive account_id as string", async () => {
    // This call will throw because the v1 client omits x-api-version (HTTP 400)
    const user = await fetchUserProfile(101, BASE_URL);

    // BC-1: if somehow the call succeeds, the response must not be a 400
    // (these assertions are the "what correct looks like" contract)

    // BC-3: the old numeric `id` field must not be present in a v2 response
    expect(
      (user as Record<string, unknown>)["id"],
      "BC-3: v2 response must NOT contain the old numeric `id` field — it was renamed to account_id"
    ).toBeUndefined();

    // BC-4: the new `account_id` string field must be present
    expect(
      (user as Record<string, unknown>)["account_id"],
      "BC-4: v2 response must contain the new required `account_id` field"
    ).toBeDefined();

    expect(
      typeof (user as Record<string, unknown>)["account_id"],
      "BC-4: `account_id` must be a string (e.g. 'acc_101'), not a number"
    ).toBe("string");

    expect(
      (user as Record<string, unknown>)["account_id"] as string,
      "BC-4: `account_id` must match the acc_<id> format defined in openapi_v2.json"
    ).toMatch(/^acc_\d+$/);
  });

  // BC-2 ——————————————————————————————————————————————————————————————————————
  // The v1 createUser omits x-api-version. The v2 backend rejects it with
  // HTTP 400. This test also validates the v2 response shape for POST.
  it("BC-2 + BC-3 + BC-4 (POST): createUser must send x-api-version: '2.0' and receive account_id as string", async () => {
    const payload = {
      user_name: "beta_contract_check",
      email: "beta@aegisguard.dev",
      status: "active",
    };

    // This call will throw because the v1 client omits x-api-version (HTTP 400)
    const created = await createUser(payload, BASE_URL);

    // BC-3 (POST path): old `id` field must not exist in v2 created response
    expect(
      (created as Record<string, unknown>)["id"],
      "BC-3 POST: v2 created response must NOT contain the old numeric `id` field"
    ).toBeUndefined();

    // BC-4 (POST path): new `account_id` string field must be present
    expect(
      (created as Record<string, unknown>)["account_id"],
      "BC-4 POST: v2 created response must contain the new required `account_id` field"
    ).toBeDefined();

    expect(
      typeof (created as Record<string, unknown>)["account_id"],
      "BC-4 POST: `account_id` must be a string (e.g. 'acc_102'), not a number"
    ).toBe("string");

    expect(
      (created as Record<string, unknown>)["account_id"] as string,
      "BC-4 POST: `account_id` must match the acc_<id> format defined in openapi_v2.json"
    ).toMatch(/^acc_\d+$/);
  });
});
