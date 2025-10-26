from __future__ import annotations

import json
from typing import Any, Dict, Mapping, Optional, Tuple

from pydantic import BaseModel, ConfigDict, PositiveInt

from .utils import sanitize_property_name

DATASET_NAME = "FreedomIntelligence/medical-o1-reasoning-SFT"
DATASET_CONFIG: Optional[str] = (
    "en"  # Config name for the dataset (e.g., 'en', 'zh', 'en_mix', 'zh_mix')
)
DATASET_SPLIT = "train"
DATASET_TASK_REFERENCE: Optional[str] = None  # No task field in this dataset
DATASET_INPUT_REFERENCE: str = "Question"  # Use description as the main text
DATASET_OUTPUT_REFERENCE: list[str] = [
    "Response",
]  # Use company name and website as output

DEFAULT_BATCH_SIZE = 32
DEFAULT_MODEL_NAME = "text-embedding-3-large"
DEFAULT_CLASS_NAME = "LLMTrainingSample"
DEFAULT_MAX_SAMPLES: Optional[int] = None


class DatasetConfig(BaseModel):
    model_config = ConfigDict(frozen=True)

    dataset_name: str
    dataset_config: Optional[str]
    dataset_split: str
    text_field: str
    task_field: Optional[str]
    expected_output_fields: Tuple[str, ...]
    text_property: str
    task_property: str
    expected_output_property: str
    static_metadata: Dict[str, str]
    max_samples: Optional[PositiveInt] = None

    def translate_record(self, record: Mapping[str, Any]) -> Optional[Dict[str, str]]:
        input_raw = record.get(self.text_field)
        if input_raw is None:
            return None
        input_text = str(input_raw).strip()
        if not input_text:
            return None

        task_value = ""
        if self.task_field:
            task_raw = record.get(self.task_field)
            if task_raw is not None:
                task_text = str(task_raw).strip()
                if task_text:
                    task_value = task_text

        expected_payload = []
        for field in self.expected_output_fields:
            value = record.get(field)
            if value is None:
                return None
            expected_payload.append(value)

        try:
            expected_output_json = json.dumps(expected_payload)
        except (TypeError, ValueError):
            return None

        return {
            self.text_property: input_text,
            self.task_property: task_value,
            self.expected_output_property: expected_output_json,
            **self.static_metadata,
        }


def parse_dataset_config() -> DatasetConfig:
    dataset_name = DATASET_NAME
    dataset_config = DATASET_CONFIG
    dataset_split = DATASET_SPLIT

    text_field = DATASET_INPUT_REFERENCE
    task_field = DATASET_TASK_REFERENCE

    expected_output_fields = tuple(DATASET_OUTPUT_REFERENCE)
    if not expected_output_fields:
        raise RuntimeError(
            f"DATASET_OUTPUT_REFERENCE for dataset '{dataset_name}' must contain at least one field."
        )

    text_property = sanitize_property_name("input")
    task_property = sanitize_property_name("task")
    expected_output_property = sanitize_property_name("output_reference")

    static_metadata = {
        "datasetName": dataset_name,
        "datasetSplit": dataset_split,
    }

    max_samples = DEFAULT_MAX_SAMPLES

    return DatasetConfig(
        dataset_name=dataset_name,
        dataset_config=dataset_config,
        dataset_split=dataset_split,
        text_field=text_field,
        task_field=task_field,
        expected_output_fields=expected_output_fields,
        text_property=text_property,
        task_property=task_property,
        expected_output_property=expected_output_property,
        static_metadata=static_metadata,
        max_samples=max_samples,
    )
