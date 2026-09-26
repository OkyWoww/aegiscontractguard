"""
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
    return new_user
