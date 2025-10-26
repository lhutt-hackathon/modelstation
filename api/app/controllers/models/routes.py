"""Model management routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.lib.auth import get_current_user

router = APIRouter(prefix="/models", tags=["models"])


class CreateModelRequest(BaseModel):
    """Request to create a new model."""

    name: str
    prompt: str
    base_model: str = "flux-dev"


class ModelResponse(BaseModel):
    """Model response."""

    id: str
    name: str
    status: str
    base_model: str
    created_at: str
    updated_at: str


class ModelsListResponse(BaseModel):
    """Models list response."""

    models: list[ModelResponse]
    count: int


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_model(
    req: Request,
    request: CreateModelRequest,
    user_id: Annotated[str, Depends(get_current_user)],
) -> ModelResponse:
    """
    Create a new model.

    This will create a Model entry and a Training entry.
    The actual training implementation will be added later.
    """
    db = req.app.state.prisma

    try:
        # Create the model
        model = await db.model.create(
            data={
                "name": request.name,
                "status": "pending",
                "baseModel": request.base_model,
                "userId": user_id,
            }
        )

        # Create a training entry (placeholder for now)
        await db.training.create(
            data={
                "status": "queued",
                "modelId": model.id,
            }
        )

        return ModelResponse(
            id=model.id,
            name=model.name,
            status=model.status,
            base_model=model.baseModel,
            created_at=model.createdAt.isoformat(),
            updated_at=model.updatedAt.isoformat(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create model: {str(e)}",
        ) from e


@router.get("")
async def list_models(
    req: Request,
    user_id: Annotated[str, Depends(get_current_user)],
) -> ModelsListResponse:
    """List all models for the authenticated user."""
    db = req.app.state.prisma

    try:
        models = await db.model.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"},
        )

        return ModelsListResponse(
            models=[
                ModelResponse(
                    id=model.id,
                    name=model.name,
                    status=model.status,
                    base_model=model.baseModel,
                    created_at=model.createdAt.isoformat(),
                    updated_at=model.updatedAt.isoformat(),
                )
                for model in models
            ],
            count=len(models),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list models: {str(e)}",
        ) from e


@router.delete("/{model_id}")
async def delete_model(
    req: Request,
    model_id: str,
    user_id: Annotated[str, Depends(get_current_user)],
) -> dict:
    """Delete a model."""
    db = req.app.state.prisma

    try:
        # Check if model exists and belongs to user
        model = await db.model.find_first(
            where={"id": model_id, "userId": user_id}
        )

        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found",
            )

        # Delete the model (cascade will delete training and datasets)
        await db.model.delete(where={"id": model_id})

        return {"message": "Model deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete model: {str(e)}",
        ) from e
