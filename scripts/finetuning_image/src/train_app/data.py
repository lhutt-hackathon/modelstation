"""Dataset loading and formatting helpers."""

from pathlib import Path
from typing import Callable, Dict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from datasets import Dataset


def infer_dataset_format(path: Path) -> Optional[str]:
    suffix = path.suffix.lower()
    if suffix in {".json", ".jsonl"}:
        return "json"
    if suffix in {".csv", ".tsv"}:
        return "csv"
    if suffix == ".parquet":
        return "parquet"
    if suffix == ".txt":
        return "text"
    return None


def load_training_dataset(
    dataset_ref: str,
    split: str,
    dataset_format: str,
    dataset_field: Optional[str],
    dataset_config: Optional[str],
) -> "Dataset":
    from datasets import DatasetDict, load_dataset, load_from_disk

    path = Path(dataset_ref)
    if path.exists():
        if path.is_dir():
            try:
                loaded = load_from_disk(str(path))
            except Exception as exc:
                raise ValueError(
                    f"Failed to load dataset from directory {path}"
                ) from exc
            if isinstance(loaded, DatasetDict):
                if split not in loaded:
                    raise ValueError(
                        f"Split '{split}' not found in dataset loaded from {path}. "
                        f"Available splits: {list(loaded.keys())}"
                    )
                return loaded[split]
            return loaded

        format_name = dataset_format
        if format_name == "auto":
            format_name = infer_dataset_format(path)
            if format_name is None:
                raise ValueError(
                    f"Could not infer dataset format from file extension '{path.suffix}'. "
                    "Provide --dataset-format explicitly."
                )
        kwargs: Dict[str, object] = {"data_files": str(path), "split": split}
        if format_name == "json" and dataset_field is not None:
            kwargs["field"] = dataset_field
        if dataset_config is not None:
            kwargs["name"] = dataset_config
        return load_dataset(format_name, **kwargs)  # type: ignore[arg-type]

    kwargs = {"split": split}
    if dataset_field is not None:
        kwargs["field"] = dataset_field
    if dataset_config is not None:
        kwargs["name"] = dataset_config
    try:
        return load_dataset(dataset_ref, **kwargs)
    except ValueError as exc:
        if dataset_config is None and "Config name is missing" in str(exc):
            # Fall back to the default "en" config if the hub dataset requires a name.
            retry_kwargs = dict(kwargs)
            retry_kwargs["name"] = "en"
            return load_dataset(dataset_ref, **retry_kwargs)
        raise


def build_chatml_converter(
    system_column: Optional[str],
    user_column: str,
    assistant_column: str,
) -> Callable[[Dict[str, object]], Dict[str, object]]:
    system_column = system_column or ""

    def _convert(example: Dict[str, object]) -> Dict[str, object]:
        conversations = []
        if system_column:
            if system_column not in example:
                raise KeyError(
                    f"System column '{system_column}' not present in dataset example."
                )
            conversations.append(
                {"role": "system", "content": str(example[system_column])}
            )
        if user_column not in example:
            raise KeyError(
                f"User column '{user_column}' not present in dataset example."
            )
        if assistant_column not in example:
            raise KeyError(
                f"Assistant column '{assistant_column}' not present in dataset example."
            )
        conversations.append({"role": "user", "content": str(example[user_column])})
        conversations.append(
            {"role": "assistant", "content": str(example[assistant_column])}
        )
        return {"conversations": conversations}

    return _convert


def build_formatting_fn(tokenizer) -> Callable[[Dict[str, object]], Dict[str, object]]:
    def formatting_prompts_func(examples: Dict[str, object]) -> Dict[str, object]:
        convos = examples["conversations"]
        texts = [
            tokenizer.apply_chat_template(
                convo,
                tokenize=False,
                add_generation_prompt=False,
            ).removeprefix("<bos>")
            for convo in convos
        ]
        return {"text": texts}

    return formatting_prompts_func
