"""RunPod API client functions for managing pods."""

from __future__ import annotations

from typing import Any

import requests

from app.config.settings import settings


RUNPOD_API_BASE = "https://rest.runpod.io/v1"


class RunPodError(Exception):
    """Base exception for RunPod API errors."""

    pass


def _make_request(
    method: str,
    endpoint: str,
    json_data: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """
    Make a REST API request to RunPod API.

    Args:
        method: HTTP method (GET, POST, DELETE, etc.)
        endpoint: API endpoint path
        json_data: Optional JSON data for the request body

    Returns:
        Response data from the API, or None if response is empty

    Raises:
        RunPodError: If the API request fails
    """
    if not settings.RUNPOD_KEY:
        raise RunPodError("RUNPOD_KEY not configured")

    api_key = settings.RUNPOD_KEY.get_secret_value() if settings.RUNPOD_KEY else None
    if not api_key:
        raise RunPodError("RUNPOD_KEY not configured")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    url = f"{RUNPOD_API_BASE}{endpoint}"

    try:
        response = requests.request(
            method=method,
            url=url,
            json=json_data,
            headers=headers,
            timeout=30.0,
        )
        response.raise_for_status()
        
        # Some endpoints return empty responses
        if not response.text or response.text.strip() == "":
            return None
            
        return response.json()

    except requests.HTTPError as e:
        try:
            error_detail = response.json()
            raise RunPodError(f"HTTP {response.status_code}: {error_detail}") from e
        except Exception:
            raise RunPodError(f"HTTP error occurred: {str(e)}") from e
    except Exception as e:
        raise RunPodError(f"Unexpected error: {str(e)}") from e


def create_pod(
    name: str,
    image_name: str,
    env: dict[str, str] | None = None,
) -> dict[str, Any]:
    """
    Create a new RunPod pod with H100 80GB HBM3 GPU.

    Args:
        name: Name for the pod
        image_name: Docker image to use (e.g., "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel")
        env: Environment variables as key-value pairs

    Returns:
        Pod creation response containing pod ID and details

    Raises:
        RunPodError: If pod creation fails
    """
    payload = {
        "name": name,
        "imageName": image_name,
        "gpuTypeIds": ["NVIDIA H100 80GB HBM3"],
        "cloudType": "SECURE",
        "volumeInGb": 50,
        "containerDiskInGb": 50,
        "gpuCount": 1,
        "ports": ["8888/http", "22/tcp"],
        "env": env or {},
    }

    return _make_request("POST", "/pods", payload)


def stop_pod(pod_id: str) -> dict[str, Any]:
    """
    Stop a running RunPod pod.

    Args:
        pod_id: ID of the pod to stop

    Returns:
        Response containing the stopped pod details

    Raises:
        RunPodError: If stopping the pod fails
    """
    result = _make_request("POST", f"/pods/{pod_id}/stop", None)
    return result or {"status": "stopped", "id": pod_id}


def resume_pod(pod_id: str) -> dict[str, Any]:
    """
    Resume a stopped RunPod pod.

    Args:
        pod_id: ID of the pod to resume

    Returns:
        Response containing the resumed pod details

    Raises:
        RunPodError: If resuming the pod fails
    """
    result = _make_request("POST", f"/pods/{pod_id}/start", None)
    return result or {"status": "resumed", "id": pod_id}


def terminate_pod(pod_id: str) -> dict[str, Any]:
    """
    Terminate (permanently delete) a RunPod pod.

    Args:
        pod_id: ID of the pod to terminate

    Returns:
        Response with termination status

    Raises:
        RunPodError: If terminating the pod fails
    """
    result = _make_request("DELETE", f"/pods/{pod_id}", None)
    return result or {"status": "terminated", "id": pod_id}


def get_pod(pod_id: str) -> dict[str, Any]:
    """
    Get details of a specific RunPod pod.

    Args:
        pod_id: ID of the pod to retrieve

    Returns:
        Pod details including status, runtime info, etc.

    Raises:
        RunPodError: If retrieving pod fails
    """
    return _make_request("GET", f"/pods/{pod_id}", None)


def list_pods() -> list[dict[str, Any]]:
    """
    List all pods for the authenticated user.

    Returns:
        List of pod details

    Raises:
        RunPodError: If listing pods fails
    """
    response = _make_request("GET", "/pods", None)
    # The REST API returns a list directly, not wrapped in an object
    if isinstance(response, list):
        return response
    # Fallback for backwards compatibility
    return response.get("pods", [])
