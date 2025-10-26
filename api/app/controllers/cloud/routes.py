"""Cloud provider routes for managing pods (RunPod)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.lib import runpod

router = APIRouter(prefix="/cloud", tags=["cloud"])


# Request/Response Models


class CreatePodRequest(BaseModel):
    name: str = Field(..., description="Name for the pod")
    image_name: str = Field(
        ...,
        description="Docker image to use",
        examples=["runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel"],
    )
    env: dict[str, str] | None = Field(default=None, description="Environment variables")


class PodIdRequest(BaseModel):
    pod_id: str = Field(..., description="ID of the pod")


class PodResponse(BaseModel):
    """Response model for pod operations."""

    data: dict[str, Any]
    message: str | None = None


class ErrorResponse(BaseModel):
    """Error response model."""

    detail: str


# Routes


@router.post(
    "/pods",
    response_model=PodResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new pod",
    description="Create a new RunPod H100 80GB HBM3 GPU pod",
    responses={
        201: {"description": "Pod created successfully"},
        500: {"model": ErrorResponse, "description": "Pod creation failed"},
    },
)
async def create_pod(request: CreatePodRequest) -> PodResponse:
    """Create a new RunPod H100 pod."""
    try:
        pod_data = runpod.create_pod(
            name=request.name,
            image_name=request.image_name,
            env=request.env,
        )
        return PodResponse(data=pod_data, message="H100 pod created successfully")
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create pod: {str(e)}",
        ) from e


@router.post(
    "/pods/{pod_id}/stop",
    response_model=PodResponse,
    summary="Stop a pod",
    description="Stop a running RunPod pod",
    responses={
        200: {"description": "Pod stopped successfully"},
        500: {"model": ErrorResponse, "description": "Failed to stop pod"},
    },
)
async def stop_pod(pod_id: str) -> PodResponse:
    """Stop a running RunPod pod."""
    try:
        pod_data = runpod.stop_pod(pod_id)
        return PodResponse(data=pod_data, message="Pod stopped successfully")
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop pod: {str(e)}",
        ) from e


@router.post(
    "/pods/{pod_id}/resume",
    response_model=PodResponse,
    summary="Resume a pod",
    description="Resume a stopped RunPod pod",
    responses={
        200: {"description": "Pod resumed successfully"},
        500: {"model": ErrorResponse, "description": "Failed to resume pod"},
    },
)
async def resume_pod(pod_id: str) -> PodResponse:
    """Resume a stopped RunPod pod."""
    try:
        pod_data = runpod.resume_pod(pod_id)
        return PodResponse(data=pod_data, message="Pod resumed successfully")
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resume pod: {str(e)}",
        ) from e


@router.delete(
    "/pods/{pod_id}",
    response_model=PodResponse,
    summary="Terminate a pod",
    description="Permanently terminate (delete) a RunPod pod",
    responses={
        200: {"description": "Pod terminated successfully"},
        500: {"model": ErrorResponse, "description": "Failed to terminate pod"},
    },
)
async def terminate_pod(pod_id: str) -> PodResponse:
    """Terminate (permanently delete) a RunPod pod."""
    try:
        result = runpod.terminate_pod(pod_id)
        return PodResponse(data=result, message="Pod terminated successfully")
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to terminate pod: {str(e)}",
        ) from e


@router.get(
    "/pods/{pod_id}",
    response_model=PodResponse,
    summary="Get pod details",
    description="Get detailed information about a specific RunPod pod",
    responses={
        200: {"description": "Pod details retrieved successfully"},
        500: {"model": ErrorResponse, "description": "Failed to retrieve pod details"},
    },
)
async def get_pod(pod_id: str) -> PodResponse:
    """Get details of a specific RunPod pod."""
    try:
        pod_data = runpod.get_pod(pod_id)
        if not pod_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pod with ID {pod_id} not found",
            )
        return PodResponse(data=pod_data, message="Pod details retrieved successfully")
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pod: {str(e)}",
        ) from e


@router.get(
    "/pods",
    response_model=PodResponse,
    summary="List all pods",
    description="List all RunPod pods for the authenticated account",
    responses={
        200: {"description": "Pods list retrieved successfully"},
        500: {"model": ErrorResponse, "description": "Failed to list pods"},
    },
)
async def list_pods() -> PodResponse:
    """List all RunPod pods."""
    try:
        pods = runpod.list_pods()
        return PodResponse(
            data={"pods": pods, "count": len(pods)},
            message=f"Retrieved {len(pods)} pod(s)",
        )
    except runpod.RunPodError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list pods: {str(e)}",
        ) from e
