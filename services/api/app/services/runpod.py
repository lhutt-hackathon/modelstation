"""RunPod/S3 service for uploading results as TensorFlow Dataset."""
from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from typing import Any

import httpx
import tensorflow as tf


def create_tf_dataset(
    embedding: list[float],
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Create a TensorFlow Dataset structure from embedding and Weaviate results.

    Args:
        embedding: The query embedding vector
        results: List of search results from Weaviate

    Returns:
        Dictionary representing a TensorFlow Dataset configuration
    """
    # Create dataset examples - each result becomes a training example
    examples = []
    for result in results:
        example = {
            "query_embedding": embedding,
            "result": result,
            # Extract metadata for easier access
            "certainty": result.get("_additional", {}).get("certainty"),
            "distance": result.get("_additional", {}).get("distance"),
        }
        examples.append(example)

    # Create TensorFlow Dataset structure
    dataset_config = {
        "dataset_type": "tf.data.Dataset",
        "version": "1.0",
        "query": {
            "embedding": embedding,
            "embedding_dim": len(embedding),
        },
        "examples": examples,
        "count": len(examples),
        "metadata": {
            "timestamp": datetime.now(UTC).isoformat(),
            "source": "weaviate-model-station",
        },
    }

    return dataset_config


async def upload_to_runpod(
    embedding: list[float],
    results: list[dict[str, Any]],
) -> str:
    """
    Upload search results as a TensorFlow Dataset to S3/RunPod bucket.

    Args:
        embedding: The query embedding vector
        results: List of search results to upload

    Returns:
        URL or identifier of the uploaded data

    Raises:
        ValueError: If required environment variables are not set
        httpx.HTTPError: If the API request fails
    """
    s3_access_key = os.getenv("S3_ACCESS_KEY")
    s3_secret_key = os.getenv("S3_SECRET_KEY")
    s3_bucket_url = os.getenv("S3_BUCKET_URL")

    if not s3_access_key:
        raise ValueError("S3_ACCESS_KEY environment variable is not set")
    if not s3_secret_key:
        raise ValueError("S3_SECRET_KEY environment variable is not set")
    if not s3_bucket_url:
        raise ValueError("S3_BUCKET_URL environment variable is not set")

    # Create TensorFlow Dataset structure
    dataset_config = create_tf_dataset(embedding, results)

    # Prepare filename
    timestamp = datetime.now(UTC).isoformat()
    filename = f"training-data-{timestamp}.json"

    # Upload to S3-compatible storage (RunPod)
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{s3_bucket_url}/{filename}",
            headers={
                "x-amz-access-key": s3_access_key,
                "x-amz-secret-key": s3_secret_key,
                "Content-Type": "application/json",
            },
            content=json.dumps(dataset_config, indent=2),
            timeout=30.0,
        )
        response.raise_for_status()

        # Return the URL of the uploaded file
        return f"{s3_bucket_url}/{filename}"
