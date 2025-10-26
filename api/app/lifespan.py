import json
from collections.abc import AsyncIterator
from contextlib import AsyncExitStack, asynccontextmanager

import bcrypt
from fastapi import FastAPI
from prisma import Prisma


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    stack = AsyncExitStack()
    try:
        prisma = Prisma()
        await prisma.connect()

        demo_email = "demo@modelstation.ai"
        demo_user = await prisma.user.find_unique(where={"email": demo_email})

        if demo_user is None:
            hashed_password = bcrypt.hashpw("modelstation".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            await prisma.user.create(
                data={
                    "name": "Demo User",
                    "email": demo_email,
                    "password": hashed_password,
                }
            )

        stack.push_async_callback(prisma.disconnect)
        app.state.prisma = prisma

        yield
    finally:
        await stack.aclose()
