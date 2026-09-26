import { User, CreateUserInput } from "./userTypes";

/**
 * AegisContractGuard - TypeScript HTTP Client (v1 Baseline)
 * Utilizes native Fetch API to communicate with FastAPI endpoints.
 */

/**
 * Fetches a user profile by numeric ID from the backend.
 * Baseline v1 behavior: does not supply any x-api-version headers.
 *
 * @param userId - Numerical user ID (e.g. 101)
 * @param baseUrl - Base URL of the FastAPI backend service
 * @returns Promise resolving to User object adhering to v1 contract
 */
export async function fetchUserProfile(
  userId: number,
  baseUrl: string = "http://127.0.0.1:8000"
): Promise<User> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const targetUrl = `${cleanBaseUrl}/users/${userId}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-version": "2.0",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch user profile (HTTP ${response.status} ${response.statusText}): ${errorText}`
    );
  }

  const payload = (await response.json()) as User;
  return payload;
}

/**
 * Creates a new user with baseline payload schema.
 *
 * @param input - Payload containing user_name, email, status
 * @param baseUrl - Base URL of the FastAPI backend service
 * @returns Promise resolving to newly created User object
 */
export async function createUser(
  input: CreateUserInput,
  baseUrl: string = "http://127.0.0.1:8000"
): Promise<User> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const targetUrl = `${cleanBaseUrl}/users`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-version": "2.0",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create user (HTTP ${response.status} ${response.statusText}): ${errorText}`
    );
  }

  const payload = (await response.json()) as User;
  return payload;
}
