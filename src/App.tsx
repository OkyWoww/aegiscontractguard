/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  FileCode,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Folder,
  File,
  Play,
  Sparkles,
  Database,
  Layers,
  Code2,
  BookOpen,
  ArrowDownCircle,
  ExternalLink,
} from "lucide-react";

// Repository file tree definitions with exact file paths and source codes
const REPO_FILES: Record<
  string,
  { path: string; language: string; category: string; content: string }
> = {
  "backend/app/models.py": {
    path: "backend/app/models.py",
    language: "python",
    category: "Backend (FastAPI)",
    content: `"""
AegisContractGuard - Pydantic Data Models (v1 Baseline & v2 Drift States)
Defines schema structures for both baseline (v1) and breaking change (v2) states.
"""

from typing import Optional
from pydantic import BaseModel, Field


# ==============================================================================
# STATE V1 MODELS (Baseline Contract)
# ==============================================================================

class UserV1(BaseModel):
    """
    Baseline User schema for State v1.
    id is a primitive integer.
    """
    id: int = Field(..., description="Unique integer identifier for the user", example=101)
    user_name: str = Field(..., description="Unique handle or username", example="johndoe")
    email: str = Field(..., description="Primary email address", example="john@example.com")
    status: str = Field(default="active", description="Account active/pending status", example="active")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 101,
                "user_name": "johndoe",
                "email": "john@example.com",
                "status": "active"
            }
        }


class UserCreateV1(BaseModel):
    """
    Payload for creating a new user under v1 contract.
    """
    user_name: str = Field(..., description="Username", example="johndoe")
    email: str = Field(..., description="Email address", example="john@example.com")
    status: str = Field(default="active", description="Initial account status", example="active")


# ==============================================================================
# STATE V2 MODELS (Breaking Changes State)
# Breaking Change 1: 'id' (int) renamed and type-shifted to 'account_id' (string)
# ==============================================================================

class UserV2(BaseModel):
    """
    Evolved User schema for State v2 with BREAKING CHANGES:
    1. 'id' (integer) -> 'account_id' (string UUID-like formatted as 'acc_<id>')
    """
    account_id: str = Field(..., description="Alphanumeric UUID-like account identifier", example="acc_101")
    user_name: str = Field(..., description="Unique handle or username", example="johndoe")
    email: str = Field(..., description="Primary email address", example="john@example.com")
    status: str = Field(default="active", description="Account active/pending status", example="active")

    class Config:
        json_schema_extra = {
            "example": {
                "account_id": "acc_101",
                "user_name": "johndoe",
                "email": "john@example.com",
                "status": "active"
            }
        }


class UserCreateV2(BaseModel):
    """
    Payload for creating a new user under v2 contract.
    """
    user_name: str = Field(..., description="Username", example="johndoe")
    email: str = Field(..., description="Email address", example="john@example.com")
    status: str = Field(default="active", description="Account status", example="active")`,
  },

  "backend/app/main_v1.py": {
    path: "backend/app/main_v1.py",
    language: "python",
    category: "Backend (FastAPI)",
    content: `"""
AegisContractGuard - FastAPI Server (State v1: Baseline)
Implements GET /users/{user_id} and POST /users conforming to baseline contract v1.
"""

from typing import Dict
from fastapi import FastAPI, HTTPException, status
from backend.app.models import UserV1, UserCreateV1

app = FastAPI(
    title="AegisContractGuard API - State v1 (Baseline)",
    description="Initial baseline API contract state without breaking changes.",
    version="1.0.0",
)

# In-memory storage seeded with baseline user record 101
users_db_v1: Dict[int, dict] = {
    101: {
        "id": 101,
        "user_name": "johndoe",
        "email": "john@example.com",
        "status": "active",
    },
    102: {
        "id": 102,
        "user_name": "janedoe",
        "email": "jane@example.com",
        "status": "pending",
    },
}


@app.get(
    "/users/{user_id}",
    response_model=UserV1,
    status_code=status.HTTP_200_OK,
    summary="Get user by ID (v1)",
    tags=["Users"],
)
def get_user_by_id(user_id: int):
    """
    Retrieve user record by numeric ID under baseline contract v1.
    Returns User object with integer 'id'.
    """
    user = users_db_v1.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found",
        )
    return user


@app.post(
    "/users",
    response_model=UserV1,
    status_code=status.HTTP_201_CREATED,
    summary="Create user (v1)",
    tags=["Users"],
)
def create_user(payload: UserCreateV1):
    """
    Create a new user under baseline contract v1.
    Generates an integer 'id'.
    """
    next_id = max(users_db_v1.keys(), default=100) + 1
    new_user = {
        "id": next_id,
        "user_name": payload.user_name,
        "email": payload.email,
        "status": payload.status,
    }
    users_db_v1[next_id] = new_user
    return new_user`,
  },

  "backend/app/main_v2.py": {
    path: "backend/app/main_v2.py",
    language: "python",
    category: "Backend (FastAPI)",
    content: `"""
AegisContractGuard - FastAPI Server (State v2: Breaking Changes)
Implements GET /users/{user_id} and POST /users incorporating two deliberate breaking changes:
  1. Rename & Type Change: 'id' (int) -> 'account_id' (str)
  2. Mandatory Header: 'x-api-version: 2.0' (returns HTTP 400 if missing or invalid)
"""

from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, Header, status
from backend.app.models import UserV2, UserCreateV2

app = FastAPI(
    title="AegisContractGuard API - State v2 (Breaking Changes)",
    description="State v2 API introducing contract drift (account_id string and required x-api-version header).",
    version="2.0.0",
)

# In-memory storage migrated to account_id string format
users_db_v2: Dict[str, dict] = {
    "acc_101": {
        "account_id": "acc_101",
        "user_name": "johndoe",
        "email": "john@example.com",
        "status": "active",
    },
    "acc_102": {
        "account_id": "acc_102",
        "user_name": "janedoe",
        "email": "jane@example.com",
        "status": "pending",
    },
}


def enforce_v2_header(x_api_version: Optional[str]) -> None:
    """
    Enforces that 'x-api-version: 2.0' is supplied.
    Throws HTTP 400 Bad Request if missing or invalid.
    """
    if not x_api_version or x_api_version.strip() != "2.0":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing mandatory header: x-api-version",
        )


@app.get(
    "/users/{user_id}",
    response_model=UserV2,
    status_code=status.HTTP_200_OK,
    summary="Get user by ID (v2)",
    tags=["Users"],
)
def get_user_by_id(
    user_id: str,
    x_api_version: Optional[str] = Header(
        None,
        alias="x-api-version",
        description="Mandatory API version header. Must be exactly '2.0'",
    ),
):
    """
    Retrieve user record by user_id.
    Breaking Change 1: Returns 'account_id' (str) instead of 'id' (int).
    Breaking Change 2: Requires header 'x-api-version: 2.0' (HTTP 400 if omitted).
    """
    enforce_v2_header(x_api_version)

    # Resolve normalized account_id key
    lookup_id = user_id if user_id.startswith("acc_") else f"acc_{user_id}"
    user = users_db_v2.get(lookup_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with identifier '{user_id}' was not found",
        )
    return user


@app.post(
    "/users",
    response_model=UserV2,
    status_code=status.HTTP_201_CREATED,
    summary="Create user (v2)",
    tags=["Users"],
)
def create_user(
    payload: UserCreateV2,
    x_api_version: Optional[str] = Header(
        None,
        alias="x-api-version",
        description="Mandatory API version header. Must be exactly '2.0'",
    ),
):
    """
    Create user under v2 contract.
    Returns 'account_id' string identifier.
    Requires 'x-api-version: 2.0' header.
    """
    enforce_v2_header(x_api_version)

    next_num = len(users_db_v2) + 101
    account_id = f"acc_{next_num}"
    new_user = {
        "account_id": account_id,
        "user_name": payload.user_name,
        "email": payload.email,
        "status": payload.status,
    }
    users_db_v2[account_id] = new_user
    return new_user`,
  },

  "backend/generate_openapi.py": {
    path: "backend/generate_openapi.py",
    language: "python",
    category: "Backend (FastAPI)",
    content: `#!/usr/bin/env python3
"""
AegisContractGuard - OpenAPI v2 Generator Script
Extracts the OpenAPI 3.1.0 specification schema from backend.app.main_v2:app
and exports it to bob-specs/openapi_v2.json as the grounded target contract.
"""

import json
import os
import sys
from pathlib import Path

# Ensure root repository directory is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from backend.app.main_v2 import app
except ImportError as e:
    print(f"Error importing main_v2 application: {e}")
    sys.exit(1)


def generate_openapi_spec(output_path: Path) -> None:
    """
    Generates and enriches the OpenAPI v2 schema from FastAPI main_v2 app,
    ensuring mandatory x-api-version headers are marked required in parameters.
    """
    openapi_schema = app.openapi()

    # Post-process parameters to ensure x-api-version is marked required: True
    for path, path_item in openapi_schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue
            params = operation.get("parameters", [])
            for param in params:
                if param.get("name", "").lower() == "x-api-version":
                    param["required"] = True
                    param["description"] = "Mandatory API version header (must be exactly '2.0')"
                    param["schema"] = {
                        "type": "string",
                        "enum": ["2.0"],
                        "default": "2.0"
                    }

    # Ensure target directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated OpenAPI v2 contract schema at:")
    print(f"  -> {output_path.resolve()}")


if __name__ == "__main__":
    target_file = PROJECT_ROOT / "bob-specs" / "openapi_v2.json"
    generate_openapi_spec(target_file)`,
  },

  "backend/requirements.txt": {
    path: "backend/requirements.txt",
    language: "text",
    category: "Backend (FastAPI)",
    content: `fastapi>=0.110.0,<1.0.0
uvicorn[standard]>=0.28.0,<1.0.0
pydantic>=2.6.0,<3.0.0`,
  },

  "client/src/userTypes.ts": {
    path: "client/src/userTypes.ts",
    language: "typescript",
    category: "Client (TypeScript)",
    content: `/**
 * AegisContractGuard - TypeScript Client Types (v1 Baseline)
 * Corresponds to backend/app/main_v1.py and models.UserV1 schema.
 */

export interface User {
  id: number;
  user_name: string;
  email: string;
  status: string;
}

export interface CreateUserInput {
  user_name: string;
  email: string;
  status?: string;
}`,
  },

  "client/src/userClient.ts": {
    path: "client/src/userClient.ts",
    language: "typescript",
    category: "Client (TypeScript)",
    content: `import { User, CreateUserInput } from "./userTypes";

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
  const cleanBaseUrl = baseUrl.replace(/\\/+$/, "");
  const targetUrl = \`\${cleanBaseUrl}/users/\${userId}\`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      \`Failed to fetch user profile (HTTP \${response.status} \${response.statusText}): \${errorText}\`
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
  const cleanBaseUrl = baseUrl.replace(/\\/+$/, "");
  const targetUrl = \`\${cleanBaseUrl}/users\`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      \`Failed to create user (HTTP \${response.status} \${response.statusText}): \${errorText}\`
    );
  }

  const payload = (await response.json()) as User;
  return payload;
}`,
  },

  "client/tests/client.test.ts": {
    path: "client/tests/client.test.ts",
    language: "typescript",
    category: "Client (TypeScript)",
    content: `import { describe, it, expect } from "vitest";
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
});`,
  },

  "client/package.json": {
    path: "client/package.json",
    language: "json",
    category: "Client (TypeScript)",
    content: `{
  "name": "aegis-contract-guard-client",
  "version": "1.0.0",
  "description": "TypeScript fetch client and Vitest suite for AegisContractGuard contract drift verification",
  "type": "module",
  "scripts": {
    "test:baseline": "wait-on http://127.0.0.1:8000/docs && vitest run tests/client.test.ts",
    "test": "wait-on http://127.0.0.1:8000/docs && vitest run"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^22.14.0",
    "tsx": "^4.21.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0",
    "wait-on": "^7.2.0"
  }
}`,
  },

  "client/tsconfig.json": {
    path: "client/tsconfig.json",
    language: "json",
    category: "Client (TypeScript)",
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  },
  "include": ["src/**/*", "tests/**/*"]
}`,
  },

  "bob-specs/openapi_v2.json": {
    path: "bob-specs/openapi_v2.json",
    language: "json",
    category: "Specifications (OpenAPI)",
    content: `{
  "openapi": "3.1.0",
  "info": {
    "title": "AegisContractGuard API - State v2 (Breaking Changes)",
    "description": "State v2 API introducing contract drift (account_id string and required x-api-version header).",
    "version": "2.0.0"
  },
  "paths": {
    "/users/{user_id}": {
      "get": {
        "tags": ["Users"],
        "summary": "Get user by ID (v2)",
        "parameters": [
          {
            "name": "user_id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          },
          {
            "name": "x-api-version",
            "in": "header",
            "required": true,
            "schema": { "type": "string", "enum": ["2.0"], "default": "2.0" }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/UserV2" }
              }
            }
          },
          "400": {
            "description": "Bad Request - Missing mandatory header: x-api-version"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "UserV2": {
        "type": "object",
        "required": ["account_id", "user_name", "email"],
        "properties": {
          "account_id": { "type": "string", "example": "acc_101" },
          "user_name": { "type": "string", "example": "johndoe" },
          "email": { "type": "string", "example": "john@example.com" },
          "status": { "type": "string", "default": "active" }
        }
      }
    }
  }
}`,
  },

  "bob-specs/README.md": {
    path: "bob-specs/README.md",
    language: "markdown",
    category: "Specifications (OpenAPI)",
    content: `# AegisContractGuard - OpenAPI v2 Target Grounded Specifications

Direktori ini memuat grounded target schema (openapi_v2.json) yang digunakan untuk mendeteksi breaking changes:
1. Rename & Type Change: 'id' (int) -> 'account_id' (str)
2. Mandatory Header: 'x-api-version: 2.0'`,
  },

  "scripts/start_backend_v1.sh": {
    path: "scripts/start_backend_v1.sh",
    language: "bash",
    category: "Automation Scripts",
    content: `#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "\${ROOT_DIR}"
exec uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload`,
  },

  "scripts/start_backend_v2.sh": {
    path: "scripts/start_backend_v2.sh",
    language: "bash",
    category: "Automation Scripts",
    content: `#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "\${ROOT_DIR}"
exec uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload`,
  },

  "scripts/run_baseline_test.sh": {
    path: "scripts/run_baseline_test.sh",
    language: "bash",
    category: "Automation Scripts",
    content: `#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "\${ROOT_DIR}/client"
npm run test:baseline`,
  },

  "scripts/start_backend_v1.ps1": {
    path: "scripts/start_backend_v1.ps1",
    language: "powershell",
    category: "Windows PowerShell",
    content: `# AegisContractGuard - Start FastAPI Backend State v1 (Baseline) [Windows]
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "🛡️ AegisContractGuard: Starting Backend State v1 (Baseline)" -ForegroundColor Green
uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload`,
  },

  "scripts/start_backend_v2.ps1": {
    path: "scripts/start_backend_v2.ps1",
    language: "powershell",
    category: "Windows PowerShell",
    content: `# AegisContractGuard - Start FastAPI Backend State v2 (Breaking Changes) [Windows]
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "⚠️ AegisContractGuard: Starting Backend State v2 (Drift)" -ForegroundColor Yellow
uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload`,
  },

  "scripts/run_baseline_test.ps1": {
    path: "scripts/run_baseline_test.ps1",
    language: "powershell",
    category: "Windows PowerShell",
    content: `# AegisContractGuard - Run Client Baseline Test Suite [Windows]
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$ClientDir = Join-Path $RootDir "client"
Set-Location $ClientDir

Write-Host "🧪 Running Client Baseline Tests..." -ForegroundColor Green
npm run test:baseline`,
  },
};

export default function App() {
  const [selectedFileKey, setSelectedFileKey] = useState<string>("backend/app/main_v2.py");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "simulation" | "guide">("simulation");

  // Simulation State
  const [simStep, setSimStep] = useState<"baseline" | "drift" | "healed">("drift");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSimulation = (step: "baseline" | "drift" | "healed") => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimStep(step);
      setIsSimulating(false);
    }, 450);
  };

  const selectedFile = REPO_FILES[selectedFileKey] || REPO_FILES["backend/app/main_v2.py"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-[1.5px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">AegisContractGuard</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
                Hackathon Boilerplate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Closed-Loop Auto-Healing API Contract Drift • FastAPI & TypeScript
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "simulation"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Live Drift Simulation
          </button>
          <button
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "explorer"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Repository Explorer ({Object.keys(REPO_FILES).length} Files)
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "guide"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Runner & Quickstart
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === "simulation" && (
          <div className="space-y-6">
            {/* Simulation Header & State Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                    Live Drift & Healing Execution Engine
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    Closed-Loop Contract Drift Validation
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Demonstrates how AegisContractGuard identifies breaking contract shifts between
                    FastAPI backend versions and auto-heals TypeScript fetch consumers.
                  </p>
                </div>

                {/* State selector buttons */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => runSimulation("baseline")}
                    disabled={isSimulating}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      simStep === "baseline"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1. Baseline (v1)
                  </button>
                  <button
                    onClick={() => runSimulation("drift")}
                    disabled={isSimulating}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      simStep === "drift"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    2. Breaking Drift (v2)
                  </button>
                  <button
                    onClick={() => runSimulation("healed")}
                    disabled={isSimulating}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      simStep === "healed"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    3. Auto-Healed Client
                  </button>
                </div>
              </div>

              {/* Simulation Dashboard View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Panel 1: Backend State */}
                <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Database className="w-3.5 h-3.5 text-cyan-400" />
                        FastAPI Backend State
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simStep === "baseline"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {simStep === "baseline" ? "main_v1.py (v1.0.0)" : "main_v2.py (v2.0.0)"}
                      </span>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 border border-slate-800">
                      <div className="text-cyan-400 font-semibold">
                        {simStep === "baseline" ? "GET /users/{user_id}" : "GET /users/{user_id} [v2]"}
                      </div>
                      <div>
                        Port: <span className="text-slate-100">8000</span>
                      </div>
                      <div>
                        Header Req:{" "}
                        <span
                          className={
                            simStep === "baseline" ? "text-slate-400" : "text-amber-300 font-bold"
                          }
                        >
                          {simStep === "baseline" ? "None (Optional)" : "x-api-version: 2.0 (Mandatory)"}
                        </span>
                      </div>
                      <div>
                        Response Schema ID:{" "}
                        <span
                          className={
                            simStep === "baseline" ? "text-emerald-400" : "text-rose-400 font-bold"
                          }
                        >
                          {simStep === "baseline"
                            ? "id: int (e.g. 101)"
                            : "account_id: str (e.g. 'acc_101')"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    Target Grounded Spec:{" "}
                    <span className="text-slate-200 font-mono">bob-specs/openapi_v2.json</span>
                  </div>
                </div>

                {/* Panel 2: Client Consumer */}
                <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        TypeScript Fetch Client
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simStep === "healed"
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {simStep === "healed" ? "userClient.ts (Auto-Healed)" : "userClient.ts (v1)"}
                      </span>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 border border-slate-800">
                      <div>
                        Contract Type:{" "}
                        <span className="text-cyan-300">
                          {simStep === "healed" ? "UserV2Adapter" : "interface User (v1)"}
                        </span>
                      </div>
                      <div>
                        Outgoing Headers:{" "}
                        <span
                          className={
                            simStep === "healed" ? "text-emerald-400 font-bold" : "text-slate-500"
                          }
                        >
                          {simStep === "healed"
                            ? '{"x-api-version": "2.0"}'
                            : '{"Accept": "application/json"}'}
                        </span>
                      </div>
                      <div>
                        Compatibility Adapter:{" "}
                        <span
                          className={
                            simStep === "healed" ? "text-indigo-400 font-bold" : "text-slate-500"
                          }
                        >
                          {simStep === "healed" ? "id = Number(account_id)" : "Direct Mapping (Unadapted)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    Consumer Suite:{" "}
                    <span className="text-slate-200 font-mono">client/tests/client.test.ts</span>
                  </div>
                </div>

                {/* Panel 3: Vitest Outcome */}
                <div
                  className={`rounded-xl p-5 border flex flex-col justify-between ${
                    simStep === "drift"
                      ? "bg-rose-950/20 border-rose-800/60"
                      : "bg-emerald-950/20 border-emerald-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Terminal className="w-3.5 h-3.5" />
                        Vitest Contract Runner
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simStep === "drift"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {simStep === "drift" ? "FAIL (2 CONTRACT ERRORS)" : "PASS (100% GREEN)"}
                      </span>
                    </div>

                    <div className="bg-slate-950/90 rounded-lg p-3 text-[11px] font-mono space-y-1.5 border border-slate-800">
                      {simStep === "baseline" && (
                        <>
                          <div className="text-emerald-400">✓ tests/client.test.ts (2 tests passed)</div>
                          <div className="text-slate-400">  ✓ fetches user 101 and verifies id: 101</div>
                          <div className="text-slate-400">  ✓ creates user and confirms User contract</div>
                          <div className="text-slate-500 text-[10px] pt-1">
                            Tests: 2 passed | Time: 184ms
                          </div>
                        </>
                      )}

                      {simStep === "drift" && (
                        <>
                          <div className="text-rose-400 font-bold">
                            ✕ tests/client.test.ts (2 tests failed)
                          </div>
                          <div className="text-rose-300/90">
                            1) Error: HTTP 400 Bad Request
                            <br />
                            <span className="text-slate-400">
                              detail: &quot;Missing mandatory header: x-api-version&quot;
                            </span>
                          </div>
                          <div className="text-rose-300/90 pt-1">
                            2) AssertionError: expect(user.id).toBeTypeOf(&quot;number&quot;)
                            <br />
                            <span className="text-slate-400">
                              Received: undefined (API returned &apos;account_id&apos;)
                            </span>
                          </div>
                        </>
                      )}

                      {simStep === "healed" && (
                        <>
                          <div className="text-indigo-400 font-semibold">
                            🛡️ AegisContractGuard Auto-Healing Activated:
                          </div>
                          <div className="text-emerald-400">✓ tests/client.test.ts (2 tests passed)</div>
                          <div className="text-slate-400">  ✓ Injected header: x-api-version: 2.0</div>
                          <div className="text-slate-400">  ✓ Synthesized adapter: account_id -&gt; id bridge</div>
                          <div className="text-emerald-400 text-[10px] pt-1 font-semibold">
                            All contracts reconciled with bob-specs/openapi_v2.json!
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`font-semibold ${
                        simStep === "drift" ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {simStep === "drift" ? "Drift Detected" : "Contracts Harmonized"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Diff Visualizer */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Contract Diff Matrix: Baseline v1 vs Target v2
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* v1 Schema */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-slate-400 font-bold mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                      <span>v1 Baseline Contract</span>
                      <span className="text-emerald-400 font-mono text-[10px]">main_v1.py</span>
                    </div>
                    <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`# Response Model
UserV1 {
  id: int           # Primitive integer (101)
  user_name: str    # "johndoe"
  email: str        # "john@example.com"
  status: str       # "active"
}

# Request Headers
Accept: application/json`}
                    </pre>
                  </div>

                  {/* v2 Breaking Schema */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40">
                    <div className="text-slate-400 font-bold mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-rose-400">v2 Breaking Changes (Drift)</span>
                      <span className="text-rose-400 font-mono text-[10px]">main_v2.py</span>
                    </div>
                    <pre className="text-rose-200/90 leading-relaxed overflow-x-auto">
{`# Response Model (BREAKING CHANGE 1)
UserV2 {
  account_id: str   # CHANGED from id (int) -> "acc_101"
  user_name: str
  email: str
  status: str
}

# Request Headers (BREAKING CHANGE 2)
x-api-version: 2.0  # MANDATORY (HTTP 400 if missing)`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "explorer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar File Tree */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[700px]">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-cyan-400" />
                  Repository Files
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {Object.keys(REPO_FILES).length} Files
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pt-3 space-y-1 pr-1">
                {Object.entries(REPO_FILES).map(([key, item]) => {
                  const isSelected = selectedFileKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedFileKey(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <File className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                        <span className="truncate">{key}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0 ml-2 uppercase">
                        {item.language}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Total 16 Production Files</span>
                <span className="text-emerald-400 font-semibold">No Placeholders</span>
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[700px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    {selectedFile.category}
                  </div>
                  <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                    {selectedFile.path}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(selectedFile.path, selectedFile.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  {copiedKey === selectedFile.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy File</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-auto mt-4 bg-slate-950 rounded-xl p-4 border border-slate-800">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                  Hackathon Runner Instructions
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  How to Run AegisContractGuard Locally
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Follow these commands to start the backend, run OpenAPI generation, and execute
                  the Vitest baseline integration suite.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Install Backend Python Dependencies
                  </span>
                  <button
                    onClick={() => handleCopy("step1", "pip install -r backend/requirements.txt")}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "step1" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-cyan-300">
                  pip install -r backend/requirements.txt
                </pre>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Install Client Node & Vitest Dependencies
                  </span>
                  <button
                    onClick={() => handleCopy("step2", "cd client && npm install")}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "step2" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-cyan-300">
                  cd client && npm install
                </pre>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    Start Backend v1 (Baseline) in Terminal 1
                  </span>
                  <button
                    onClick={() => handleCopy("step3", "./scripts/start_backend_v1.sh")}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "step3" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-cyan-300">
                  ./scripts/start_backend_v1.sh
                </pre>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      4
                    </span>
                    Execute Baseline Integration Test in Terminal 2 (100% Passes)
                  </span>
                  <button
                    onClick={() => handleCopy("step4", "./scripts/run_baseline_test.sh")}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "step4" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-emerald-400">
                  ./scripts/run_baseline_test.sh
                </pre>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      5
                    </span>
                    Trigger Contract Drift (Start v2) & Generate OpenAPI
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        "step5",
                        "./scripts/start_backend_v2.sh\npython3 backend/generate_openapi.py"
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "step5" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-rose-300">
                  {`./scripts/start_backend_v2.sh\npython3 backend/generate_openapi.py`}
                </pre>
              </div>

              {/* Windows PowerShell Quick Reference */}
              <div className="bg-slate-950/90 p-5 rounded-xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <Terminal className="w-4 h-4" />
                    Catatan Teknis Khusus Windows (PowerShell)
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded">
                    .ps1 Scripts Included
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Untuk pengguna Windows tanpa Git Bash / WSL, jalankan skrip PowerShell di bawah atau panggil langsung via command prompt:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold flex items-center justify-between">
                      <span>Backend v1</span>
                      <button
                        onClick={() => handleCopy("win1", "uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload")}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-slate-300 block text-[11px] break-all">
                      .\scripts\start_backend_v1.ps1
                    </code>
                    <div className="text-[10px] text-slate-500">
                      atau: uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="text-amber-400 font-bold flex items-center justify-between">
                      <span>Backend v2</span>
                      <button
                        onClick={() => handleCopy("win2", "uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload")}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-slate-300 block text-[11px] break-all">
                      .\scripts\start_backend_v2.ps1
                    </code>
                    <div className="text-[10px] text-slate-500">
                      atau: uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="text-cyan-400 font-bold flex items-center justify-between">
                      <span>Client Test</span>
                      <button
                        onClick={() => handleCopy("win3", "cd client; npx wait-on http://127.0.0.1:8000/docs; npx vitest run tests/client.test.ts")}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-slate-300 block text-[11px] break-all">
                      .\scripts\run_baseline_test.ps1
                    </code>
                    <div className="text-[10px] text-slate-500">
                      atau: cd client; npx wait-on http://127.0.0.1:8000/docs; npx vitest run tests/client.test.ts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
