"""Pipeline routes for end-to-end prompt processing."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from httpx import HTTPError
from openai import OpenAIError
from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from app.services.pipeline import PipelineResult, PipelineService


router = APIRouter(prefix="/pipeline", tags=["pipeline"])


class ProcessRequest(BaseModel):
    """Request body for running the pipeline."""

    model_config = ConfigDict(populate_by_name=True)

    prompt: str = Field(min_length=1, description="User-provided model prompt")
    model_uid: str = Field(
        min_length=1,
        description="UID returned when the model entry was created",
        validation_alias=AliasChoices("modelUid", "model_uid", "uid"),
        serialization_alias="modelUid",
    )
    limit: int | None = Field(
        default=None, ge=1, le=100, description="Optional override for result limit"
    )


class ProcessResponse(BaseModel):
    """Pipeline execution summary."""

    message: str
    results_count: int
    dataset_uid: str
    dataset_type: str
    huggingface_url: str | None = Field(
        default=None, description="Location of the persisted dataset on Hugging Face"
    )
    embedding_dim: int


def _build_success_message(result: PipelineResult) -> str:
    count = len(result.results)
    if count == 0:
        return "Pipeline completed but no relevant training data was retrieved."
    if result.huggingface_url:
        return (
            f"Successfully published {count} training examples to Hugging Face dataset "
            f"for uid {result.uid}."
        )
    return f"Retrieved {count} training examples for uid {result.uid}."


@router.post(
    "/process",
    response_model=ProcessResponse,
    status_code=status.HTTP_200_OK,
)
async def process_prompt(payload: ProcessRequest) -> ProcessResponse:
    """Execute the full pipeline for the supplied prompt and model UID."""
    service = PipelineService()

    try:
        result = await service.run(
            uid=payload.model_uid,
            prompt=payload.prompt,
            limit=payload.limit,
        )
    except (ValueError, OpenAIError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Vector search request failed: {exc}",
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {exc}",
        ) from exc

    dataset_payload: dict[str, Any] = result.dataset_payload
    dataset_type = dataset_payload.get("dataset_type", "tf.data.Dataset")

    return ProcessResponse(
        message=_build_success_message(result),
        results_count=len(result.results),
        dataset_uid=result.uid,
        dataset_type=dataset_type,
        huggingface_url=result.huggingface_url,
        embedding_dim=len(result.embedding),
    )
