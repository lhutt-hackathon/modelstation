"""Shared FastAPI dependency providers."""
from __future__ import annotations

from fastapi import Request
from prisma import Prisma

from app.lib.auth import get_session

__all__ = ["get_prisma", "get_session"]


async def get_prisma(request: Request) -> Prisma:
    """Return the Prisma client stored on the FastAPI app state."""
    prisma: Prisma | None = getattr(request.app.state, "prisma", None)
    if prisma is None:
        raise RuntimeError("Prisma client is not initialised on application state")
    return prisma
