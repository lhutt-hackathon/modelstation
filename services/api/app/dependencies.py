from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Annotated, Any, Optional

from fastapi import Depends, Header, HTTPException, status
from prisma import Prisma

from app.database import prisma

if TYPE_CHECKING:
    from prisma.models import Session, User


async def get_prisma() -> Prisma:
    if not prisma.is_connected():
        await prisma.connect()
    return prisma


async def get_session(
    authorization: Annotated[Optional[str], Header(alias="Authorization")] = None,
    db: Prisma = Depends(get_prisma),
) -> Any:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    session = await db.session.find_unique(
        where={"token": token},
        include={"user": True},
    )

    if session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    if session.expiresAt < datetime.now(timezone.utc):
        await db.session.delete(
            where={"id": session.id},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    return session


async def get_current_user(session: Any = Depends(get_session)) -> Any:
    if session.user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return session.user
