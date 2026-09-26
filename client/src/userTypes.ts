/**
 * AegisContractGuard - TypeScript Client Types (v2 — patched by Subagent Gamma)
 * Corresponds to backend/openapi_v2.json and models.UserV2 schema.
 * BC-3 / BC-4: `id: number` renamed to `account_id: string` (format: acc_<id>).
 */

export interface User {
  account_id: string;
  user_name: string;
  email: string;
  status: string;
}

export interface CreateUserInput {
  user_name: string;
  email: string;
  status?: string;
}
