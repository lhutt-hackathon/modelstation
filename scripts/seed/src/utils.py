from __future__ import annotations

import time
from typing import Dict, Iterator, TYPE_CHECKING

from datasets import Dataset, load_dataset

if TYPE_CHECKING:
    from .config import DatasetConfig


class ProgressPrinter:
    def __init__(self, label: str) -> None:
        self._label = label
        self._count = 0
        self._start = time.perf_counter()

    def update(self, amount: int = 1) -> None:
        self._count += amount
        elapsed = time.perf_counter() - self._start
        rate = self._count / elapsed if elapsed > 0 else 0.0
        if self._count % 10 == 0:
            print(f"{self._label}: iter {self._count}, rate {rate:.2f}/s")

    def close(self) -> None:
        return None


def sanitize_property_name(raw_name: str) -> str:
    sanitized = "".join(ch if ch.isalnum() else "_" for ch in raw_name.strip())
    if not sanitized:
        raise ValueError(f"Cannot derive property name from '{raw_name}'.")
    if not sanitized[0].isalpha():
        sanitized = f"prop_{sanitized}"
    return sanitized[0].lower() + sanitized[1:]


def load_samples(config: "DatasetConfig") -> Iterator[Dict[str, str]]:
    dataset: Dataset = load_dataset(
        config.dataset_name,
        config.dataset_config,
        split=config.dataset_split,  # type: ignore[arg-type]
    )

    emitted = False
    produced = 0
    for record in dataset:
        sample = config.translate_record(record)
        if sample is None:
            continue

        emitted = True
        produced += 1
        yield sample

        if config.max_samples is not None and produced >= config.max_samples:
            break

    if not emitted:
        raise RuntimeError(
            f"No usable samples found in {config.dataset_name}:{config.dataset_split}. "
            "Verify that the configured dataset references are correct."
        )
