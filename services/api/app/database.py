from __future__ import annotations

import app.prisma_patch  # noqa: F401 - Must be imported first to patch Pydantic

from prisma import Prisma


prisma = Prisma()


async def connect() -> None:
    if not prisma.is_connected():
        await prisma.connect()


async def disconnect() -> None:
    if prisma.is_connected():
        await prisma.disconnect()
