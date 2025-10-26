from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Dict, Iterable, List, Optional

from huggingface_hub import HfApi
from huggingface_hub.utils import HfHubHTTPError

import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.query import MetadataQuery
from weaviate.client import Client as WeaviateClient

from openai import OpenAI

from .settings import Settings

logger = logging.getLogger(__name__)


@dataclass
class DatasetRow:
    input: str
    output_reference: str
    task: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def as_dict(self) -> Dict[str, Any]:
        payload = {
            "input": self.input,
            "output_reference": self.output_reference,
            "task": self.task,
        }
        if self.metadata:
            payload["metadata"] = self.metadata
        return payload


@dataclass
class DatasetGenerationResult:
    repo_id: str
    row_count: int
    query: str


def build_weaviate_client(settings: Settings) -> WeaviateClient:
    auth = Auth.api_key(settings.weaviate_api_key) if settings.weaviate_api_key else None
    # headers = {
    #     "X-OpenAI-Api-Key": settings.openai_api_key,
    # }
    return weaviate.connect_to_weaviate_cloud(
        cluster_url=settings.weaviate_url,
        auth_credentials=auth,
        # headers=headers,
    )


class DatasetGenerator:
    def __init__(self, client: WeaviateClient, settings: Settings):
        self._client = client
        self._settings = settings
        self._hf_api = HfApi(token=settings.huggingface_token)
        self._open_ai_client = OpenAI(api_key=settings.openai_api_key)

    def generate(self, query: str, model_uuid: str) -> DatasetGenerationResult:
        rows = list(self._fetch_rows(query))
        if not rows:
            raise ValueError("No rows matched the provided query")

        repo_id = self._settings.dataset_repo_id(model_uuid)
        self._push_to_huggingface(rows, repo_id, query=query)

        return DatasetGenerationResult(repo_id=repo_id, row_count=len(rows), query=query)

    def _fetch_rows(self, query: str) -> Iterable[DatasetRow]:
        logger.info("Querying Weaviate for `%s` (limit=%d)", query, self._settings.weaviate_query_limit)
        collection = self._get_collection()
        try:
            response = self._open_ai_client.embeddings.create(model="text-embedding-3-large", input=[query])
            if not len(response.data):
                raise RuntimeError(
                    "OpenAI embeddings response size ."
                )
            embedding = response.data[0].embedding

            res = collection.query.near_vector(
                near_vector=embedding,
                limit=self._settings.weaviate_query_limit,
                return_metadata=MetadataQuery(distance=True),
            )
        except Exception as exc:  # pragma: no cover - network error path
            self._handle_query_error(exc)

        for obj in res.objects:
            props: Dict[str, Any] = obj.properties or {}
            metadata_dict = self._format_metadata(obj)
            yield DatasetRow(
                input=str(props.get("input", "")),
                output_reference=str(props.get("output_reference", "")),
                task=props.get("task"),
                metadata=metadata_dict,
            )

    def _get_collection(self):
        try:
            return self._client.collections.get(self._settings.weaviate_index_name)
        except Exception as exc:
            hint = self._collection_hint()
            message = (
                f"Weaviate collection `{self._settings.weaviate_index_name}` not found. "
                "Set `SEMANTIC_SPLIT_WEAVIATE_INDEX_NAME` to an existing collection."
            )
            if hint:
                message = f"{message} {hint}"
            raise ValueError(message) from exc

    def _handle_query_error(self, exc: Exception) -> None:
        error_message = str(exc)
        lowered = error_message.lower()
        if "could not find class" in lowered:
            hint = self._collection_hint()
            detail = (
                f"Weaviate collection `{self._settings.weaviate_index_name}` not found. "
                "Set `SEMANTIC_SPLIT_WEAVIATE_INDEX_NAME` to an existing collection."
            )
            if hint:
                detail = f"{detail} {hint}"
            raise ValueError(detail) from exc
        if "could not vectorize input" in lowered or "vectorizer module" in lowered:
            raise ValueError(
                "The selected Weaviate collection does not have a vectorizer configured. "
                "Enable a vectorizer module for the collection or use a collection with vectorization support."
            ) from exc
        raise RuntimeError(f"Weaviate query failed: {exc}") from exc

    def _collection_hint(self) -> str:
        try:
            available = sorted(self._client.collections.list_all())
        except Exception:
            return ""
        if not available:
            return ""
        joined = ", ".join(available[:10])
        suffix = "..." if len(available) > 10 else ""
        return f"Available collections: {joined}{suffix}."

    def _push_to_huggingface(self, rows: List[DatasetRow], repo_id: str, query: str) -> None:
        logger.info("Pushing %d rows to %s", len(rows), repo_id)
        try:
            self._hf_api.create_repo(
                repo_id=repo_id,
                repo_type="dataset",
                exist_ok=True,
                private=self._settings.hf_private,
            )
        except HfHubHTTPError as exc:  # pragma: no cover - depends on network
            raise RuntimeError(f"Failed to ensure dataset repo `{repo_id}` exists: {exc}") from exc

        with TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            data_path = tmp_path / "data.jsonl"
            readme_path = tmp_path / "README.md"

            with data_path.open("w", encoding="utf-8") as handle:
                for row in rows:
                    handle.write(json.dumps(row.as_dict(), ensure_ascii=False))
                    handle.write("\n")

            readme_content = self._build_readme(len(rows), query)
            readme_path.write_text(readme_content, encoding="utf-8")

            self._hf_api.upload_file(
                path_or_fileobj=str(data_path),
                path_in_repo="data/data.jsonl",
                repo_id=repo_id,
                repo_type="dataset",
            )
            self._hf_api.upload_file(
                path_or_fileobj=str(readme_path),
                path_in_repo="README.md",
                repo_id=repo_id,
                repo_type="dataset",
            )

    def _build_readme(self, row_count: int, query: str) -> str:
        visibility = "private" if self._settings.hf_private else "public"
        return (
            f"# Semantic Split Dataset\n\n"
            f"- Query: `{query}`\n"
            f"- Row count: {row_count}\n"
            f"- Visibility: {visibility}\n\n"
            "Each row contains the input prompt, the associated `output_reference`, optional `task`, "
            "and optional metadata returned by Weaviate."
        )

    @staticmethod
    def _format_metadata(obj: Any) -> Optional[Dict[str, Any]]:
        metadata = getattr(obj, "metadata", None)
        if metadata is None and not hasattr(obj, "uuid"):
            return None
        candidate: Dict[str, Any] = {}
        distance = getattr(metadata, "distance", None) if metadata is not None else None
        if distance is not None:
            candidate["distance"] = distance
        obj_uuid = getattr(obj, "uuid", None)
        if obj_uuid is not None:
            candidate["id"] = str(obj_uuid)
        cleaned = {key: value for key, value in candidate.items() if value is not None}
        return cleaned or None
