from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any, Optional

from fastapi import Depends, Header, HTTPException, status, Request

async def get_session(
    request: Request,
    authorization: Annotated[Optional[str], Header(alias="Authorization")] = None,
) -> Any:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    prisma = request.app.state.prisma
    session = await prisma.session.find_unique(
        where={"token": token},
        include={"user": True},
    )

    if session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    if session.expiresAt < datetime.now(timezone.utc):
        await prisma.session.delete(
            where={"id": session.id},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    return session


async def get_current_user(session: Any = Depends(get_session)) -> Any:
    if session.user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    return session.user
