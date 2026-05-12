from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserCreate(BaseModel):
    email: str
    name: str
    password: str


class AdminUserResponse(BaseModel):
    id: UUID
    email: str
    name: str

    class Config:
        from_attributes = True
