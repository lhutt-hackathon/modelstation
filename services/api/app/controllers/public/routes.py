from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_prisma


router = APIRouter(prefix="/public", tags=["public"])


def _get_attr(entity: Any, *names: str) -> Any:
    for name in names:
        if hasattr(entity, name):
            return getattr(entity, name)
    raise AttributeError(f"Attribute not found. Tried {names!r}")


def _parse_json(value: str | None) -> list[str]:
    if not value:
        return []
    try:
        data = json.loads(value)
        if isinstance(data, list):
            return [str(item) for item in data]
    except json.JSONDecodeError:
        pass
    return []


class ModelSummary(BaseModel):
    id: str
    name: str
    domain: str
    baseModel: str
    dataset: str
    status: str
    lastTrained: str
    metrics: list[str]
    highlights: list[str]


class RoadmapItemResponse(BaseModel):
    id: str
    title: str
    eta: str
    owner: str
    detail: str


class HighlightStatResponse(BaseModel):
    id: str
    title: str
    value: str
    description: str
    iconKey: str


class PortfolioResponse(BaseModel):
    models: list[ModelSummary]
    roadmapItems: list[RoadmapItemResponse]
    highlightStats: list[HighlightStatResponse]


@router.get("/portfolio", response_model=PortfolioResponse)
async def get_portfolio(db=Depends(get_prisma)) -> PortfolioResponse:
    models = await db.trainingmodel.find_many()
    roadmap_items = await db.roadmapitem.find_many()
    highlight_stats = await db.highlightstat.find_many()

    serialized_models = [
        ModelSummary(
            id=_get_attr(model, "id"),
            name=_get_attr(model, "name"),
            domain=_get_attr(model, "domain"),
            baseModel=_get_attr(model, "baseModel", "base_model"),
            dataset=_get_attr(model, "dataset"),
            status=_get_attr(model, "status"),
            lastTrained=_get_attr(model, "lastTrained", "last_trained"),
            metrics=_parse_json(_get_attr(model, "metrics")),
            highlights=_parse_json(_get_attr(model, "highlights")),
        )
        for model in models
    ]

    serialized_roadmap = [
        RoadmapItemResponse(
            id=_get_attr(item, "id"),
            title=_get_attr(item, "title"),
            eta=_get_attr(item, "eta"),
            owner=_get_attr(item, "owner"),
            detail=_get_attr(item, "detail"),
        )
        for item in roadmap_items
    ]

    serialized_highlight = [
        HighlightStatResponse(
            id=_get_attr(stat, "id"),
            title=_get_attr(stat, "title"),
            value=_get_attr(stat, "value"),
            description=_get_attr(stat, "description"),
            iconKey=_get_attr(stat, "iconKey", "icon_key"),
        )
        for stat in highlight_stats
    ]

    return PortfolioResponse(
        models=serialized_models,
        roadmapItems=serialized_roadmap,
        highlightStats=serialized_highlight,
    )
