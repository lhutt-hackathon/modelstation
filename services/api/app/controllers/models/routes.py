from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user, get_prisma


router = APIRouter(prefix="/models", tags=["models"])


def _get_attr(entity: Any, *names: str) -> Any:
    for name in names:
        if hasattr(entity, name):
            return getattr(entity, name)
    raise AttributeError(f"Attribute not found. Tried {names!r}")


class ModelResponse(BaseModel):
    id: str
    name: str
    domain: str
    baseModel: str
    dataset: str
    status: str
    lastTrained: str
    metrics: list[str]
    highlights: list[str]
    userId: str
    createdAt: datetime
    updatedAt: datetime


class ModelsListResponse(BaseModel):
    models: list[ModelResponse]


class ModelCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    domain: str = Field(min_length=1)
    baseModel: str = Field(min_length=1)
    dataset: str = Field(min_length=1, description="Training data brief for the model")


class ModelCreateResponse(BaseModel):
    model: ModelResponse


class ModelUpdateRequest(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    baseModel: Optional[str] = None
    dataset: Optional[str] = None
    status: Optional[str] = None
    lastTrained: Optional[str] = None
    metrics: Optional[list[str]] = None
    highlights: Optional[list[str]] = None


class MessageResponse(BaseModel):
    message: str


def _parse_json_field(value: Optional[str]) -> list[str]:
    if not value:
        return []
    try:
        data = json.loads(value)
        if isinstance(data, list):
            return [str(item) for item in data]
    except json.JSONDecodeError:
        pass
    return []


def _serialize_model(model: Any) -> ModelResponse:
    return ModelResponse(
        id=_get_attr(model, "id"),
        name=_get_attr(model, "name"),
        domain=_get_attr(model, "domain"),
        baseModel=_get_attr(model, "baseModel", "base_model"),
        dataset=_get_attr(model, "dataset"),
        status=_get_attr(model, "status"),
        lastTrained=_get_attr(model, "lastTrained", "last_trained"),
        metrics=_parse_json_field(_get_attr(model, "metrics")),
        highlights=_parse_json_field(_get_attr(model, "highlights")),
        userId=_get_attr(model, "userId", "user_id"),
        createdAt=_get_attr(model, "createdAt", "created_at"),
        updatedAt=_get_attr(model, "updatedAt", "updated_at"),
    )


@router.get("/", response_model=ModelsListResponse)
async def list_models(user=Depends(get_current_user), db=Depends(get_prisma)) -> ModelsListResponse:
    models = await db.trainingmodel.find_many(
        where={"userId": user.id},
    )
    return ModelsListResponse(models=[_serialize_model(model) for model in models])


@router.post("/", response_model=ModelCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    payload: ModelCreateRequest,
    user=Depends(get_current_user),
    db=Depends(get_prisma),
) -> ModelCreateResponse:
    now_iso = datetime.now(timezone.utc).isoformat()
    model = await db.trainingmodel.create(
        data={
            "name": payload.name,
            "domain": payload.domain,
            "baseModel": payload.baseModel,
            "dataset": payload.dataset,
            "status": "training",
            "lastTrained": now_iso,
            "userId": user.id,
            "metrics": json.dumps([]),
            "highlights": json.dumps([]),
        },
    )
    return ModelCreateResponse(model=_serialize_model(model))


@router.get("/{model_id}", response_model=ModelCreateResponse)
async def get_model(
    model_id: str = Path(..., description="Model identifier"),
    user=Depends(get_current_user),
    db=Depends(get_prisma),
) -> ModelCreateResponse:
    model = await db.trainingmodel.find_first(
        where={
            "id": model_id,
            "userId": user.id,
        },
    )

    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    return ModelCreateResponse(model=_serialize_model(model))


@router.delete("/{model_id}", response_model=MessageResponse)
async def delete_model(
    model_id: str,
    user=Depends(get_current_user),
    db=Depends(get_prisma),
) -> MessageResponse:
    model = await db.trainingmodel.find_first(
        where={
            "id": model_id,
            "userId": user.id,
        },
    )
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    await db.trainingmodel.delete(where={"id": model_id})
    return MessageResponse(message="Model deleted successfully")


@router.patch("/{model_id}", response_model=ModelCreateResponse)
async def update_model(
    payload: ModelUpdateRequest,
    model_id: str,
    user=Depends(get_current_user),
    db=Depends(get_prisma),
) -> ModelCreateResponse:
    existing = await db.trainingmodel.find_first(
        where={
            "id": model_id,
            "userId": user.id,
        },
    )
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    update_data: dict[str, Any] = {}
    for field in ("name", "domain", "baseModel", "dataset", "status", "lastTrained"):
        value = getattr(payload, field)
        if value is not None:
            update_data[field] = value
    if payload.metrics is not None:
        update_data["metrics"] = json.dumps(payload.metrics)
    if payload.highlights is not None:
        update_data["highlights"] = json.dumps(payload.highlights)

    model = await db.trainingmodel.update(
        data=update_data,
        where={"id": model_id},
    )

    return ModelCreateResponse(model=_serialize_model(model))
