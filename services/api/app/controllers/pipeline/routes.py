"""Pipeline routes for embedding, Weaviate retrieval, and RunPod upload."""
from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.embedding import get_embedding
from app.services.runpod import upload_to_runpod
from app.services.weaviate_client import search_weaviate


router = APIRouter(prefix="/pipeline", tags=["pipeline"])


class ProcessRequest(BaseModel):
    """Request model for processing a prompt."""

    prompt: str = Field(min_length=1, description="The user's search prompt")


class ProcessResponse(BaseModel):
    """Response model for the processing pipeline."""

    message: str
    results_count: int
    runpod_url: str | None = None


@router.post("/process", response_model=ProcessResponse, status_code=status.HTTP_200_OK)
async def process_prompt(payload: ProcessRequest) -> ProcessResponse:
    """
    Process a user prompt through the full pipeline.

    Steps:
    1. Generate embedding from prompt
    2. Search Weaviate for nearest neighbors in music-room/Collections
    3. Upload results to RunPod bucket
    """
    try:
        # Step 1: Generate embedding
        embedding = await get_embedding(payload.prompt)

        # Step 2: Search Weaviate
        results = await search_weaviate(
            collection="model-station",
            class_name="Collections",
            embedding=embedding,
            limit=10,
        )

        if not results:
            return ProcessResponse(
                message="No results found in Weaviate",
                results_count=0,
                runpod_url=None,
            )

        # Step 3: Upload to RunPod as TensorFlow Dataset
        runpod_url = await upload_to_runpod(embedding, results)

        return ProcessResponse(
            message=f"Successfully processed prompt and uploaded {len(results)} results to RunPod as TensorFlow Dataset",
            results_count=len(results),
            runpod_url=runpod_url,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {str(e)}",
        ) from e
