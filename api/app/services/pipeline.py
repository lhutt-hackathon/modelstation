"""End-to-end pipeline services for prompt processing."""
from __future__ import annotations

import asyncio
import json
import os
from dataclasses import dataclass
from datetime import UTC, datetime
from io import BytesIO
from typing import Any, Iterable

import httpx
import logging

from huggingface_hub import HfApi
from openai import AsyncOpenAI


DEFAULT_EMBED_MODEL = "text-embedding-3-large"
DEFAULT_WEAVIATE_CLASS = "Collections"
DEFAULT_WEAVIATE_LIMIT = 12
DEFAULT_MIN_CERTAINTY = 0.0


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if value and value.strip():
        return value.strip()
    raise ValueError(f"{var_name} environment variable is not set")


class EmbeddingService:
    """Generate embeddings using the OpenAI Async client."""

    def __init__(self) -> None:
        api_key = _require_env("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL")
        model_name = os.getenv("OPENAI_EMBED_MODEL", DEFAULT_EMBED_MODEL)

        self._model_name = model_name
        self._client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def embed(self, text: str) -> list[float]:
        """Create an embedding vector for the provided text."""
        response = await self._client.embeddings.create(model=self._model_name, input=[text])
        embedding_data = response.data[0].embedding
        return [float(value) for value in embedding_data]


class VectorSearchService:
    """Perform vector similarity search against Weaviate."""

    def __init__(self) -> None:
        self._url = _require_env("WEAVIATE_URL").rstrip("/")
        self._api_key = _require_env("WEAVIATE_API_KEY")
        self._class_name = os.getenv("WEAVIATE_CLASS_NAME", DEFAULT_WEAVIATE_CLASS)
        self._min_certainty = float(os.getenv("WEAVIATE_MIN_CERTAINTY", DEFAULT_MIN_CERTAINTY))

    async def search(
        self,
        *,
        embedding: Iterable[float],
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        """Query Weaviate for nearest neighbours."""
        vector_json = json.dumps(list(embedding))
        certainty_clause = ""
        if self._min_certainty > 0:
            certainty_clause = f"certainty: {self._min_certainty:.3f}"

        limit_value = limit or DEFAULT_WEAVIATE_LIMIT

        query = f"""
        {{
          Get {{
            {self._class_name}(
              nearVector: {{
                vector: {vector_json}
                {certainty_clause}
              }}
              limit: {limit_value}
            ) {{
              _additional {{
                id
                certainty
                distance
              }}
              ... on {self._class_name} {{
                title
                description
                url
                metadata
              }}
            }}
          }}
        }}
        """

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._url}/v1/graphql",
                headers=headers,
                json={"query": query},
            )
            response.raise_for_status()

        payload = response.json()
        if "errors" in payload:
            raise ValueError(f"Weaviate query error: {payload['errors']}")

        data = payload.get("data", {}).get("Get", {})
        results = data.get(self._class_name, [])
        if not isinstance(results, list):
            raise ValueError("Unexpected Weaviate response format")
        return results


def _extract_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def build_tf_dataset_payload(
    *,
    uid: str,
    prompt: str,
    embedding: list[float],
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    """Create a serialisable representation of a tf.data.Dataset."""
    timestamp = datetime.now(UTC).isoformat()
    examples: list[dict[str, Any]] = []
    for result in results:
        additional = result.get("_additional", {}) if isinstance(result, dict) else {}
        examples.append(
            {
                "uid": uid,
                "prompt": prompt,
                "query_embedding": embedding,
                "result": result,
                "certainty": _extract_float(additional.get("certainty")),
                "distance": _extract_float(additional.get("distance")),
            }
        )

    dataset_payload = {
        "dataset_type": "tf.data.Dataset",
        "schema_version": "1.1",
        "dataset_uid": uid,
        "query": {
            "uid": uid,
            "prompt": prompt,
            "embedding": embedding,
            "embedding_dim": len(embedding),
        },
        "examples": examples,
        "count": len(examples),
        "metadata": {
            "created_at": timestamp,
            "source": "modelstation-pipeline",
        },
    }
    return dataset_payload


class HuggingFacePublisher:
    """Publish dataset payloads to Hugging Face Hub."""

    def __init__(self) -> None:
        self._token = os.getenv("HF_API_TOKEN")
        self._repo_id = os.getenv("HF_DATASET_REPO_ID")
        if not self._token or not self._repo_id:
            raise ValueError("HF_API_TOKEN and HF_DATASET_REPO_ID must be set to publish datasets")
        self._api = HfApi(token=self._token)

    def _ensure_repo(self) -> None:
        self._api.create_repo(repo_id=self._repo_id, repo_type="dataset", exist_ok=True)

    def _upload_json(self, *, uid: str, data: dict[str, Any]) -> str:
        json_bytes = json.dumps(data, indent=2).encode("utf-8")
        path_in_repo = f"{uid}/dataset.json"
        self._api.upload_file(
            path_or_fileobj=BytesIO(json_bytes),
            path_in_repo=path_in_repo,
            repo_id=self._repo_id,
            repo_type="dataset",
        )
        return f"https://huggingface.co/datasets/{self._repo_id}/blob/main/{path_in_repo}"

    async def publish(self, *, uid: str, dataset_payload: dict[str, Any]) -> str:
        """Upload dataset payload to Hugging Face asynchronously."""
        await asyncio.to_thread(self._ensure_repo)
        return await asyncio.to_thread(self._upload_json, uid=uid, data=dataset_payload)


@dataclass(slots=True)
class PipelineResult:
    """Result of running the pipeline."""

    uid: str
    embedding: list[float]
    results: list[dict[str, Any]]
    dataset_payload: dict[str, Any]
    huggingface_url: str | None


class PipelineService:
    """Coordinate embedding, search, dataset creation, and publication."""

    def __init__(self) -> None:
        self._embedding_service = EmbeddingService()
        self._search_service = VectorSearchService()
        try:
            self._publisher: HuggingFacePublisher | None = HuggingFacePublisher()
        except ValueError:
            logging.getLogger(__name__).warning(
                "Hugging Face credentials not configured; skipping dataset publication."
            )
            self._publisher = None

    async def run(
        self,
        *,
        uid: str,
        prompt: str,
        limit: int | None = None,
    ) -> PipelineResult:
        """Execute the full pipeline for a user's prompt."""
        embedding = await self._embedding_service.embed(prompt)
        search_results = await self._search_service.search(embedding=embedding, limit=limit)

        dataset_payload = build_tf_dataset_payload(
            uid=uid,
            prompt=prompt,
            embedding=embedding,
            results=search_results,
        )

        huggingface_url: str | None = None
        if search_results and self._publisher is not None:
            try:
                huggingface_url = await self._publisher.publish(
                    uid=uid,
                    dataset_payload=dataset_payload,
                )
            except Exception as exc:  # noqa: BLE001
                logging.getLogger(__name__).warning(
                    "Failed to publish dataset %s to Hugging Face: %s", uid, exc
                )
                huggingface_url = None

        return PipelineResult(
            uid=uid,
            embedding=embedding,
            results=search_results,
            dataset_payload=dataset_payload,
            huggingface_url=huggingface_url,
        )
