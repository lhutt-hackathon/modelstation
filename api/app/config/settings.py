from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: Literal["dev", "prod"] = Field(
        default="dev",
    )

    session_secret: SecretStr = Field()
    session_cookie_name: str = "session"
    session_max_age_seconds: int = 60 * 60 * 24 * 7  # 7 days
    session_same_site: Literal["lax", "strict", "none"] = "lax"
    cookie_secure: bool = False
    return_path: str = "http://localhost:3000/"

    # RunPod API configuration
    RUNPOD_KEY: SecretStr | None = Field(default=None)


settings = Settings()
