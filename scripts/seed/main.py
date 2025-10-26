#!/usr/bin/env python3

"""Fetch a Hugging Face dataset, embed with OpenAI, and upsert into Weaviate."""

from __future__ import annotations

import os
import sys
from itertools import chain
from typing import Iterable

from openai import OpenAIError

from src.config import (
    DEFAULT_CLASS_NAME,
    DEFAULT_EMBED_BATCH_SIZE,
    DEFAULT_MODEL_NAME,
    DEFAULT_WEAVIATE_BATCH_SIZE,
    get_required_env,
    parse_dataset_config,
)
from src.embed import embed_samples
from src.ingest import connect_weaviate, ensure_collection, upsert_samples
from src.utils import load_samples

DEFAULT_EMBED_WORKERS = 2


def parse_positive_int_env(var_name: str, default: int) -> int:
    value = os.getenv(var_name)
    if value is None:
        return default
    try:
        parsed = int(value)
    except ValueError as exc:
        raise SystemExit(f"{var_name} must be a positive integer, got '{value}'.") from exc
    if parsed <= 0:
        raise SystemExit(f"{var_name} must be greater than zero, got {parsed}.")
    return parsed


def main() -> None:
    dataset_config = parse_dataset_config()
    openai_api_key = get_required_env("OPENAI_API_KEY")
    openai_base_url = os.getenv("OPENAI_BASE_URL")
    openai_organization = os.getenv("OPENAI_ORGANIZATION")
    weaviate_url = get_required_env("WEAVIATE_URL")
    weaviate_api_key = get_required_env("WEAVIATE_API_KEY")

    try:
        raw_samples = load_samples(dataset_config)
        samples_iter = iter(raw_samples)
        first_sample = next(samples_iter)
        samples: Iterable[dict[str, str]] = chain([first_sample], samples_iter)
    except RuntimeError as exc:
        raise SystemExit(f"Failed to load dataset: {exc}") from exc
    except StopIteration:
        raise SystemExit(
            f"No usable samples found in {dataset_config.dataset_name}:{dataset_config.dataset_split}. "
            f"Check that HF_TEXT_FIELD={dataset_config.text_field} is correct."
        )
    except Exception as exc:  # noqa: BLE001
        raise SystemExit(f"Failed to load dataset: {exc}") from exc

    weaviate_client = None
    try:
        weaviate_client = connect_weaviate(
            url=weaviate_url,
            api_key=weaviate_api_key,
            headers=None,
        )
    except Exception as exc:  # noqa: BLE001
        raise SystemExit(f"Could not initialize Weaviate client: {exc}") from exc

    embed_workers = parse_positive_int_env("EMBED_WORKERS", DEFAULT_EMBED_WORKERS)
    embedded_samples = embed_samples(
        samples,
        text_property=dataset_config.text_property,
        api_key=openai_api_key,
        base_url=openai_base_url,
        organization=openai_organization,
        model_name=DEFAULT_MODEL_NAME,
        batch_size=DEFAULT_EMBED_BATCH_SIZE,
        parallelism=embed_workers,
    )

    total_ingested = 0
    try:
        collection = ensure_collection(
            weaviate_client,
            collection_name=DEFAULT_CLASS_NAME,
            text_property=dataset_config.text_property,
            metadata_properties=[dataset_config.values_property],
        )
        total_ingested = upsert_samples(
            collection=collection,
            samples_with_vectors=embedded_samples,
            batch_size=DEFAULT_WEAVIATE_BATCH_SIZE,
        )
    except OpenAIError as exc:
        raise SystemExit(f"Failed to embed samples: {exc}") from exc
    except RuntimeError as exc:
        raise SystemExit(f"Failed to load dataset: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise SystemExit(f"Weaviate API error: {exc}") from exc
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
