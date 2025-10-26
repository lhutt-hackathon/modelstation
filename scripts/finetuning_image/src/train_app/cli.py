"""Environment-driven settings loader for the training script."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv

load_dotenv()

DEFAULT_MAX_SEQ_LENGTH = 2048

class TrainingSettings(BaseSettings):
    """Container for training configuration sourced from environment variables."""

    model_config = SettingsConfigDict(
        case_sensitive=True,
        extra="ignore",
        env_ignore_empty=True,
    )

    model_name: str = Field(..., alias="TRAIN_MODEL_NAME")
    chat_template: str = Field(..., alias="TRAIN_CHAT_TEMPLATE")
    dataset: str = Field(..., alias="TRAIN_DATASET")
    split: str = Field("train", alias="TRAIN_SPLIT")
    model_uuid: str | None = Field(default=None, alias="MODEL_UUID")
    hugging_face_token: str = Field(..., alias="HUGGING_FACE_TOKEN")
    max_seq_length: int = Field(
        DEFAULT_MAX_SEQ_LENGTH,
        alias="TRAIN_MAX_SEQ_LENGTH",
    )
    dataset_format: str = Field("auto", alias="TRAIN_DATASET_FORMAT")
    dataset_field: str | None = Field(default=None, alias="TRAIN_DATASET_FIELD")
    dataset_config: str | None = Field(default=None, alias="TRAIN_DATASET_CONFIG")
    system_column: str | None = Field(default=None, alias="TRAIN_SYSTEM_COLUMN")
    user_column: str = Field("Question", alias="TRAIN_USER_COLUMN")
    assistant_column: str = Field("Response", alias="TRAIN_ASSISTANT_COLUMN")
    per_device_train_batch_size: int = Field(
        1,
        alias="TRAIN_PER_DEVICE_TRAIN_BATCH_SIZE",
    )
    gradient_accumulation_steps: int = Field(
        1,
        alias="TRAIN_GRADIENT_ACCUMULATION_STEPS",
    )
    max_steps: int = Field(100, alias="TRAIN_MAX_STEPS")
    learning_rate: float = Field(2e-5, alias="TRAIN_LEARNING_RATE")
    output_dir: str = Field("outputs", alias="TRAIN_OUTPUT_DIR")
    resume_from_checkpoint: bool | str | None = Field(
        default=None,
        alias="TRAIN_RESUME_FROM_CHECKPOINT",
    )
    push_method: str = Field("merged_16bit", alias="TRAIN_PUSH_METHOD")


def load_settings() -> TrainingSettings:
    """Return ``TrainingSettings`` built from the current environment."""
    return TrainingSettings()
