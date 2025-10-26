from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Tuple, TYPE_CHECKING
from uuid import uuid4

from tqdm import tqdm
import weaviate
from weaviate.classes.config import Configure, DataType, Property
from weaviate.classes.init import Auth

if TYPE_CHECKING:
    from weaviate.collections.collection import Collection
    from weaviate.client import WeaviateClient


def connect_weaviate(
    url: str,
    api_key: Optional[str],
    headers: Optional[Dict[str, str]],
) -> WeaviateClient:
    auth_credentials = Auth.api_key(api_key) if api_key else None
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=url,
        auth_credentials=auth_credentials,
        headers=headers,
    )

    return client


def ensure_collection(
    client: WeaviateClient,
    collection_name: str,
    text_property: str,
    metadata_properties: Iterable[str],
) -> "Collection":
    existing_raw = client.collections.list_all()
    existing_collections = {getattr(item, "name", item) for item in existing_raw}
    if collection_name not in existing_collections:
        unique_props = {text_property, *metadata_properties, "datasetName", "datasetSplit"}
        properties = [
            Property(
                name=text_property,
                data_type=DataType.TEXT,
                description="Primary text content for fine-tuning.",
            )
        ]
        for prop in sorted(unique_props):
            if prop == text_property:
                continue
            properties.append(
                Property(
                    name=prop,
                    data_type=DataType.TEXT,
                    description=f"Metadata field '{prop}'.",
                )
            )

        client.collections.create(
            name=collection_name,
            description="Synthetic dataset for language model fine-tuning.",
            vector_config=Configure.Vectors.self_provided(),
            properties=properties,
        )

    return client.collections.get(collection_name)


def upsert_samples(
    collection: "Collection",
    samples_with_vectors: Iterable[Tuple[Dict[str, str], List[float]]],
    batch_size: int,
) -> int:
    progress = tqdm(
        desc="Uploading to Weaviate",
        unit="obj",
        disable=True,
    )
    total = 0
    if hasattr(collection, "batch"):
        batch_interface = collection.batch
        if hasattr(batch_interface, "fixed_size"):
            try:
                with batch_interface.fixed_size(batch_size=batch_size) as batch:
                    for properties, vector in samples_with_vectors:
                        batch.add_object(
                            properties=properties,
                            uuid=str(uuid4()),
                            vector=vector,
                        )
                        total += 1
                        progress.update(1)
            finally:
                progress.close()
            return total

    data_interface = collection.data
    try:
        for properties, vector in samples_with_vectors:
            data_interface.insert(
                properties=properties,
                uuid=str(uuid4()),
                vector=vector,
            )
            total += 1
            progress.update(1)
    finally:
        progress.close()
    return total
