import { describe, it, expect } from "vitest";
import { fetchUserProfile, createUser } from "../src/userClient";

describe("AegisContractGuard - TypeScript Client Baseline Contract Tests (v1)", () => {
  const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

  it("fetches user profile for user 101 and verifies id is a number", async () => {
    const user = await fetchUserProfile(101, BASE_URL);

    // Baseline v1 Contract assertions:
    expect(user).toBeDefined();
    expect(user).toHaveProperty("id");
    expect(typeof user.id).toBe("number");
    expect(user.id).toBe(101);
    expect(user.user_name).toBe("johndoe");
    expect(user.email).toBe("john@example.com");
    expect(user.status).toBe("active");
  });

  it("creates a new user and confirms response contains numeric id and valid user fields", async () => {
    const testUserPayload = {
      user_name: "aegis_tester",
      email: "tester@aegisguard.dev",
      status: "active",
    };

    const created = await createUser(testUserPayload, BASE_URL);

    expect(created).toBeDefined();
    expect(created).toHaveProperty("id");
    expect(typeof created.id).toBe("number");
    expect(created.id).toBeGreaterThanOrEqual(101);
    expect(created.user_name).toBe("aegis_tester");
    expect(created.email).toBe("tester@aegisguard.dev");
    expect(created.status).toBe("active");
  });
});
