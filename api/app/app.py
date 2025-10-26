from fastapi import FastAPI as FastAPIBase

from app.lifespan import lifespan

class FastAPI(FastAPIBase):
    def _setup_routers(self) -> None:
        from app.controllers import router

        self.include_router(router)

    def setup(self) -> None:
        super().setup()
        self._setup_routers()


app = FastAPI(lifespan=lifespan)
