"""
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
    status: str = Field(default="active", description="Account status", example="active")


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
    status: str = Field(default="active", description="Account status", example="active")
