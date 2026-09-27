"""
AegisContractGuard - FastAPI Server (State v2: Breaking Changes)
Implements GET /users/{user_id} and POST /users incorporating two deliberate breaking changes:
  1. Rename & Type Change: 'id' (int) -> 'account_id' (str)
  2. Mandatory Header: 'x-api-version: 2.0' (returns HTTP 400 if missing or invalid)
"""

from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, Header, status
from app.models import UserV2, UserCreateV2

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
    return new_user
