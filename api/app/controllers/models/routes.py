"""Model management routes."""
from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_prisma, get_session


router = APIRouter(prefix="/models", tags=["models"])


class ModelResponse(BaseModel):
    """Response model for a single model."""

    id: str
    uid: str
    name: str
    prompt: str | None
    status: str
    baseModel: str
    userId: str
    createdAt: str
    updatedAt: str


class ModelsListResponse(BaseModel):
    """Response model for list of models."""

    models: list[ModelResponse]


class CreateModelRequest(BaseModel):
    """Request model for creating a new model."""

    prompt: str = Field(min_length=1, description="The user's prompt for model creation")
    name: str | None = Field(None, description="Optional model name")
    baseModel: str = Field(default="gpt-3.5-turbo", description="Base model to use")


class CreateModelResponse(BaseModel):
    """Response model for model creation."""

    model: ModelResponse


@router.post("", response_model=CreateModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    payload: CreateModelRequest, session=Depends(get_session), db=Depends(get_prisma)
) -> CreateModelResponse:
    """
    Create a new model for the authenticated user.

    The model is created with a unique UID and initial status of 'Queued'.
    """
    user = session.user
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    # Generate unique ID for the model
    uid = str(uuid4())

    # Use prompt as name if name not provided
    model_name = payload.name or payload.prompt[:50]

    try:
        model = await db.model.create(
            data={
                "uid": uid,
                "name": model_name,
                "prompt": payload.prompt,
                "status": "Queued",
                "baseModel": payload.baseModel,
                "userId": user.id,
            }
        )

        return CreateModelResponse(
            model=ModelResponse(
                id=model.id,
                uid=model.uid,
                name=model.name,
                prompt=model.prompt,
                status=model.status,
                baseModel=model.baseModel,
                userId=model.userId,
                createdAt=model.createdAt.isoformat(),
                updatedAt=model.updatedAt.isoformat(),
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create model: {str(e)}",
        ) from e


@router.get("", response_model=ModelsListResponse, status_code=status.HTTP_200_OK)
async def list_models(
    session=Depends(get_session), db=Depends(get_prisma)
) -> ModelsListResponse:
    """
    Get all models for the authenticated user.
    """
    user = session.user
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    try:
        models = await db.model.find_many(
            where={"userId": user.id}, order={"createdAt": "desc"}
        )

        return ModelsListResponse(
            models=[
                ModelResponse(
                    id=model.id,
                    uid=model.uid,
                    name=model.name,
                    prompt=model.prompt,
                    status=model.status,
                    baseModel=model.baseModel,
                    userId=model.userId,
                    createdAt=model.createdAt.isoformat(),
                    updatedAt=model.updatedAt.isoformat(),
                )
                for model in models
            ]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch models: {str(e)}",
        ) from e


@router.get("/{uid}", response_model=CreateModelResponse, status_code=status.HTTP_200_OK)
async def get_model(
    uid: str, session=Depends(get_session), db=Depends(get_prisma)
) -> CreateModelResponse:
    """
    Get a specific model by its UID.
    """
    user = session.user
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    try:
        model = await db.model.find_unique(where={"uid": uid})

        if model is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
            )

        # Verify user owns this model
        if model.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this model",
            )

        return CreateModelResponse(
            model=ModelResponse(
                id=model.id,
                uid=model.uid,
                name=model.name,
                prompt=model.prompt,
                status=model.status,
                baseModel=model.baseModel,
                userId=model.userId,
                createdAt=model.createdAt.isoformat(),
                updatedAt=model.updatedAt.isoformat(),
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch model: {str(e)}",
        ) from e
