#!/usr/bin/env python3

"""Fetch a Hugging Face dataset, embed with OpenAI, and upsert into Weaviate."""

from __future__ import annotations

import os
import sys
from itertools import chain
from typing import Iterable
import traceback

from openai import OpenAIError

from src.config import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_CLASS_NAME,
    DEFAULT_MODEL_NAME,
    parse_dataset_config,
)
from src.embed import embed_samples
from src.ingest import connect_weaviate, ensure_collection, upsert_samples
from src.utils import load_samples


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if value and value.strip():
        return value.strip()
    raise SystemExit(f"Missing required environment variable: {var_name}")


def main() -> None:
    dataset_config = parse_dataset_config()
    openai_api_key = _require_env("OPENAI_API_KEY")
    openai_base_url = os.getenv("OPENAI_BASE_URL")
    weaviate_url = _require_env("WEAVIATE_URL")
    weaviate_api_key = _require_env("WEAVIATE_API_KEY")

    try:
        raw_samples = load_samples(dataset_config)
        samples_iter = iter(raw_samples)
        first_sample = next(samples_iter)
        samples: Iterable[dict[str, str]] = chain([first_sample], samples_iter)
    except RuntimeError as e:
        traceback.print_exc()
        raise SystemExit(f"Failed to load dataset: {e}") from e
    except StopIteration:
        traceback.print_exc()
        raise SystemExit(
            f"No usable samples found in {dataset_config.dataset_name}:{dataset_config.dataset_split}. "
            "Verify that the configured dataset references are correct."
        )
    except Exception as e:
        traceback.print_exc()
        raise SystemExit(f"Failed to load dataset: {e}") from e

    weaviate_client = None
    try:
        weaviate_client = connect_weaviate(
            url=weaviate_url,
            api_key=weaviate_api_key,
        )
    except Exception as e:
        traceback.print_exc()
        raise SystemExit(f"Could not initialize Weaviate client: {e}") from e

    embedded_samples = embed_samples(
        samples,
        text_property=dataset_config.text_property,
        api_key=openai_api_key,
        base_url=openai_base_url,
        model_name=DEFAULT_MODEL_NAME,
        batch_size=DEFAULT_BATCH_SIZE,
    )

    total_ingested = 0
    try:
        collection = ensure_collection(
            weaviate_client,
            collection_name=DEFAULT_CLASS_NAME,
            text_property=dataset_config.text_property,
            metadata_properties=[
                dataset_config.task_property,
                dataset_config.expected_output_property,
            ],
        )
        total_ingested = upsert_samples(
            collection=collection,
            samples_with_vectors=embedded_samples,
            batch_size=DEFAULT_BATCH_SIZE,
        )
    except OpenAIError as e:
        traceback.print_exc()
        raise SystemExit(f"Failed to embed samples: {e}") from e
    except RuntimeError as e:
        traceback.print_exc()
        raise SystemExit(f"Failed to load dataset: {e}") from e
    except Exception as e:
        traceback.print_exc()
        raise SystemExit(f"Weaviate API error: {e}") from e
    finally:
        if weaviate_client is not None:
            weaviate_client.close()

    print(
        f"Ingested {total_ingested} samples from "
        f"{dataset_config.dataset_name}:{dataset_config.dataset_split} "
        f"into class '{DEFAULT_CLASS_NAME}'."
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("Aborted by user.")
