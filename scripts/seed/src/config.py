from __future__ import annotations

import os
from typing import Dict, Optional

from pydantic import BaseModel, ConfigDict, PositiveInt
from .utils import sanitize_property_name

DEFAULT_DATASET_NAME = "fr3on/company"
# DEFAULT_DATASET_NAME = "UCSC-VLAA/MedTrinity-25M"
DEFAULT_DATASET_SPLIT = "train"
DEFAULT_TEXT_FIELD = "name"
DEFAULT_METADATA_FIELDS = ("website", "industry", "description")
DEFAULT_TEXT_PROPERTY = "text"
DEFAULT_VALUES_PROPERTY = "values"
DEFAULT_CLASS_NAME = "LLMTrainingSample"
DEFAULT_MODEL_NAME = "text-embedding-3-large"
DEFAULT_EMBED_BATCH_SIZE = 32
DEFAULT_WEAVIATE_BATCH_SIZE = 32


class DatasetConfig(BaseModel):
    model_config = ConfigDict(frozen=True)

    dataset_name: str
    dataset_split: str
    text_field: str
    text_property: str
    metadata_field_map: Dict[str, str]
    static_metadata: Dict[str, str]
    max_samples: Optional[PositiveInt] = None
    values_property: str

def get_required_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if value and value.strip():
        return value.strip()
    raise RuntimeError(f"Missing required environment variable: {var_name}")


def parse_dataset_config() -> DatasetConfig:
    dataset_name = os.getenv("HF_DATASET_NAME", DEFAULT_DATASET_NAME).strip()
    dataset_split = os.getenv("HF_DATASET_SPLIT", DEFAULT_DATASET_SPLIT).strip()
    text_field = os.getenv("HF_TEXT_FIELD", DEFAULT_TEXT_FIELD).strip()

    text_property_env = os.getenv("WEAVIATE_TEXT_PROPERTY", DEFAULT_TEXT_PROPERTY).strip()
    text_property = sanitize_property_name(text_property_env)

    metadata_fields_raw = os.getenv("HF_METADATA_FIELDS")
    if metadata_fields_raw:
        metadata_fields = [
            field.strip() for field in metadata_fields_raw.split(",") if field.strip()
        ]
    else:
        metadata_fields = list(DEFAULT_METADATA_FIELDS)

    metadata_field_map = {
        field: sanitize_property_name(field) for field in metadata_fields
    }

    static_metadata = {
        "datasetName": dataset_name,
        "datasetSplit": dataset_split,
    }

    values_property_env = os.getenv("WEAVIATE_VALUES_PROPERTY", DEFAULT_VALUES_PROPERTY).strip()
    values_property = sanitize_property_name(values_property_env)

    max_samples: Optional[int] = None
    max_samples_env = os.getenv("HF_MAX_SAMPLES")
    if max_samples_env:
        try:
            max_samples_value = int(max_samples_env.strip())
        except ValueError as exc:
            raise RuntimeError(
                f"HF_MAX_SAMPLES must be a positive integer, got '{max_samples_env}'."
            ) from exc
        if max_samples_value <= 0:
            raise RuntimeError(
                f"HF_MAX_SAMPLES must be greater than zero, got {max_samples_value}."
            )
        max_samples = max_samples_value

    return DatasetConfig(
        dataset_name=dataset_name,
        dataset_split=dataset_split,
        text_field=text_field,
        text_property=text_property,
        metadata_field_map=metadata_field_map,
        static_metadata=static_metadata,
        max_samples=max_samples,
        values_property=values_property,
    )
