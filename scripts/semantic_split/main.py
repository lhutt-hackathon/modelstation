from __future__ import annotations

from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.dataset_generator import DatasetGenerator, build_weaviate_client
from app.settings import get_settings


class DatasetRequest(BaseModel):
    query: str = Field(..., description="Semantic concept to search for in Weaviate")
    uuid: str = Field(..., description="Model UUID used to name the Hugging Face dataset")


class DatasetResponse(BaseModel):
    repo_id: str
    row_count: int
    query: str


def create_app() -> FastAPI:
    app = FastAPI(
        title="Semantic Split Dataset Generator",
        description="Generates semantic datasets from Weaviate and publishes them to Hugging Face",
    )

    @app.get("/healthz", tags=["health"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/datasets", response_model=DatasetResponse, tags=["datasets"])
    def create_dataset(
        payload: DatasetRequest,
        generator: DatasetGenerator = Depends(_generator_dependency),
    ) -> DatasetResponse:
        try:
            result = generator.generate(query=payload.query, model_uuid=payload.uuid)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        return DatasetResponse(
            repo_id=result.repo_id,
            row_count=result.row_count,
            query=result.query,
        )

    return app


@lru_cache(maxsize=1)
def _get_cached_generator() -> DatasetGenerator:
    settings = get_settings()
    client = build_weaviate_client(settings)
    return DatasetGenerator(client, settings)


def _generator_dependency() -> DatasetGenerator:
    return _get_cached_generator()


app = create_app()


def main() -> None:
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    main()
