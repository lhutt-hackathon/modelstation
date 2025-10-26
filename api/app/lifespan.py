import json
from collections.abc import AsyncIterator
from contextlib import AsyncExitStack, asynccontextmanager

from fastapi import FastAPI
from prisma import Prisma


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    stack = AsyncExitStack()
    try:
        prisma = Prisma()
        await prisma.connect()

        stack.push_async_callback(prisma.disconnect)
        app.state.prisma = prisma

        yield
    finally:
        await stack.aclose()
