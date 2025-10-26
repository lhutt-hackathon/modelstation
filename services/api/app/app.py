from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI as FastAPIBase

from app.database import connect, disconnect


@asynccontextmanager
async def lifespan(_: FastAPIBase):
    await connect()
    try:
        yield
    finally:
        await disconnect()


class FastAPI(FastAPIBase):
    def __init__(self) -> None:
        super().__init__(lifespan=lifespan)
        self._setup_routers()

    def _setup_routers(self) -> None:
        from app.controllers import router

        self.include_router(router)


app = FastAPI()
