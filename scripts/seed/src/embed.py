from __future__ import annotations

import atexit
from multiprocessing import get_context
from typing import Dict, Iterable, Iterator, List, Optional, Tuple

from openai import OpenAI

from .utils import ProgressPrinter

_WORKER_CLIENT: Optional[OpenAI] = None

def create_openai_client(
    api_key: str,
    base_url: Optional[str] = None,
) -> OpenAI:
    kwargs = {"api_key": api_key}
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)


def embed_samples(
    samples: Iterable[Dict[str, str]],
    text_property: str,
    *,
    api_key: str,
    base_url: Optional[str],
    model_name: str,
    batch_size: int,
) -> Iterator[Tuple[Dict[str, str], List[float]]]:
    if batch_size <= 0:
        raise ValueError("batch_size must be positive.")

    progress = ProgressPrinter("Generating embeddings with OpenAI")
    ctx = get_context("spawn")

    def task_iter() -> Iterator[Tuple[List[Dict[str, str]], str, str]]:
        for batch in _batched(samples, batch_size):
            yield batch, text_property, model_name

    with ctx.Pool(
        initializer=_init_worker_client,
        initargs=(api_key, base_url),
    ) as pool:
        try:
            for batch_result in pool.imap(_embed_batch_worker, task_iter()):
                for sample, embedding in batch_result:
                    progress.update()
                    yield sample, embedding
        finally:
            progress.close()


def _embed_batch_worker(
    args: Tuple[List[Dict[str, str]], str, str],
) -> List[Tuple[Dict[str, str], List[float]]]:
    batch, text_property, model_name = args
    client = _get_worker_client()
    inputs = [sample[text_property] for sample in batch]
    response = client.embeddings.create(model=model_name, input=inputs)
    if len(response.data) != len(batch):
        raise RuntimeError(
            "OpenAI embeddings response size did not match the input batch."
        )
    result: List[Tuple[Dict[str, str], List[float]]] = []
    for sample, item in zip(batch, response.data, strict=False):
        embedding = [float(value) for value in item.embedding]
        result.append((sample, embedding))
    return result


def _batched(
    iterable: Iterable[Dict[str, str]], batch_size: int
) -> Iterator[List[Dict[str, str]]]:
    batch: List[Dict[str, str]] = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


def _init_worker_client(api_key: str, base_url: Optional[str]) -> None:
    global _WORKER_CLIENT
    _WORKER_CLIENT = create_openai_client(
        api_key=api_key,
        base_url=base_url,
    )
    atexit.register(_close_worker_client)


def _get_worker_client() -> OpenAI:
    if _WORKER_CLIENT is None:
        raise RuntimeError("OpenAI client not initialised in worker process.")
    return _WORKER_CLIENT


def _close_worker_client() -> None:
    global _WORKER_CLIENT
    if _WORKER_CLIENT is not None:
        _WORKER_CLIENT.close()
        _WORKER_CLIENT = None
