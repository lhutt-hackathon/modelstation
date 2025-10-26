from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field

from app.lib.auth import get_session


router = APIRouter(prefix="/auth", tags=["auth"])


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


class UserOnlyResponse(BaseModel):
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class MessageResponse(BaseModel):
    message: str


def _sanitize_user(user: dict) -> UserResponse:
    user.pop("password", None)
    return UserResponse(**user)


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(payload: LoginRequest, request: Request) -> AuthResponse:
    db = request.app.state.prisma
    user = await db.user.find_unique(where={"email": payload.email})

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not bcrypt.checkpw(payload.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = str(uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.session.create(
        data={
            "userId": user.id,
            "token": token,
            "expiresAt": expires_at,
        },
    )

    return AuthResponse(user=_sanitize_user(user.dict()), token=token)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, request: Request) -> AuthResponse:
    db = request.app.state.prisma
    existing = await db.user.find_unique(where={"email": payload.email})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    hashed_password = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = await db.user.create(
        data={
            "name": payload.name,
            "email": payload.email,
            "password": hashed_password,
        },
    )

    token = str(uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.session.create(
        data={
            "userId": user.id,
            "token": token,
            "expiresAt": expires_at,
        },
    )

    return AuthResponse(user=_sanitize_user(user.dict()), token=token)


@router.get("/me", response_model=UserOnlyResponse)
async def me(session=Depends(get_session)) -> UserOnlyResponse:
    user = session.user
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return UserOnlyResponse(user=_sanitize_user(user.dict()))


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request, session=Depends(get_session)) -> MessageResponse:
    db = request.app.state.prisma
    await db.session.delete_many(where={"token": session.token})
    return MessageResponse(message="Logged out successfully")
