"""Entry point for the training application."""

from __future__ import annotations

import os

from uuid import uuid4
from huggingface_hub import login

from train_app import load_settings, train_model


def main() -> None:
    settings = load_settings()
    model, tokenizer = train_model(settings)
    login(token=settings.hugging_face_token)
    model_name = uuid4().hex if settings.model_uuid is None else settings.model_uuid
    repo_id = f"modelstation/{model_name}"
    push_method = settings.push_method.lower()
    if push_method == "lora":
        model.push_to_hub(repo_id, private=True)
        if hasattr(tokenizer, "push_to_hub"):
            tokenizer.push_to_hub(repo_id, private=True)
    elif push_method in {"merged_16bit", "merged_4bit"}:
        model.push_to_hub_merged(
            repo_id,
            tokenizer=tokenizer,
            save_method=push_method,
            private=True,
        )
    else:
        raise ValueError(
            f"Unknown TRAIN_PUSH_METHOD '{settings.push_method}'. "
            "Use 'lora', 'merged_16bit', or 'merged_4bit'."
        )
    print(f"Model pushed to Hugging Face Hub with name: modelstation/{model_name}")


if __name__ == "__main__":
    main()
