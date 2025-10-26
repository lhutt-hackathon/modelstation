from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any, Optional

from fastapi import Depends, Header, HTTPException, status, Request, Cookie

async def get_session(
    request: Request,
    authorization: Annotated[Optional[str], Header(alias="Authorization")] = None,
    modelstation_token: Annotated[Optional[str], Cookie(alias="modelstation:token")] = None,
) -> Any:
    # Try cookie first, then fall back to Authorization header
    token = None
    if modelstation_token:
        token = modelstation_token
    elif authorization:
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


async def get_current_user(session: Any = Depends(get_session)) -> str:
    if session.user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    return session.user.id
