"""Model management routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.lib.auth import get_current_user
from app.lib.runpod import create_pod, RunPodError

router = APIRouter(prefix="/models", tags=["models"])


class CreateModelRequest(BaseModel):
    """Request to create a new model."""

    name: str
    prompt: str
    base_model: str = "flux-dev"


class LaunchTrainingRequest(BaseModel):
    """Request to launch training for a model."""

    model_id: str


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


@router.post("/train")
async def launch_training(
    req: Request,
    request: LaunchTrainingRequest,
    user_id: Annotated[str, Depends(get_current_user)],
) -> dict:
    """
    Launch training for a model.

    Creates a RunPod with the 'test:v1' image and passes the model ID as UID env var.
    Updates the model status to 'training' and the training entry status to 'running'.
    """
    db = req.app.state.prisma

    try:
        # Check if model exists and belongs to user
        model = await db.model.find_first(
            where={"id": request.model_id, "userId": user_id}
        )

        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found",
            )

        # Check if model is in pending status
        if model.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot launch training for model with status '{model.status}'",
            )

        # Create RunPod with model ID as environment variable
        pod_name = f"training-{model.name}-{model.id[:8]}"
        try:
            pod_response = create_pod(
                name=pod_name,
                image_name="0x21x/finetune:v1",
                env={"UID": model.id},
            )
            pod_id = pod_response.get("id") if pod_response else None

            if not pod_id:
                raise RunPodError("Pod creation did not return a pod ID")
        except RunPodError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create training pod: {str(e)}",
            ) from e

        # Save pod to database
        await db.pod.create(
            data={
                "id": pod_id,
                "name": pod_name,
                "modelId": request.model_id,
            }
        )

        # Update model status to training
        await db.model.update(
            where={"id": request.model_id},
            data={"status": "training"},
        )

        # Update training entry status to running
        training = await db.training.find_first(
            where={"modelId": request.model_id}
        )

        if training:
            await db.training.update(
                where={"id": training.id},
                data={"status": "running"},
            )

        return {
            "message": "Training launched successfully",
            "model_id": request.model_id,
            "pod_id": pod_id,
            "status": "training",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to launch training: {str(e)}",
        ) from e
