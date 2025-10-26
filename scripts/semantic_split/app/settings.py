from functools import lru_cache
from typing import Literal, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    weaviate_url: str = Field(..., description="Base URL of the Weaviate cluster")
    weaviate_api_key: Optional[str] = Field(
        default=None, description="Optional API key for authenticating with Weaviate"
    )
    weaviate_index_name: str = Field(
        default="DatasetEntry",
        description="Target Weaviate collection/class containing the dataset rows",
    )
    weaviate_query_limit: int = Field(
        default=200,
        ge=1,
        le=5000,
        description="Maximum number of rows to retrieve from Weaviate for a dataset",
    )
    openai_api_key: str = Field(..., description="API key for accessing OpenAI services")

    huggingface_token: str = Field(
        ..., description="User or service token with write access to the organisation"
    )
    huggingface_org: str = Field(..., description="Target Hugging Face organisation")
    huggingface_dataset_prefix: str = Field(
        default="semantic-split-",
        description="Prefix used to build dataset repository names",
    )
    huggingface_visibility: Literal["public", "private"] = Field(
        default="public",
        description="Visibility of the dataset repository created on Hugging Face",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_path="../",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def dataset_repo_id(self, model_uuid: str) -> str:
        """Return the Hugging Face repo id for a given model uuid."""
        safe_uuid = model_uuid.strip().lower().replace(" ", "-")
        return f"{self.huggingface_org}/{self.huggingface_dataset_prefix}{safe_uuid}"

    @property
    def hf_private(self) -> bool:
        return self.huggingface_visibility == "private"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
