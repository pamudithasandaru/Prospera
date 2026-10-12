from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    chat_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    embedding_dim: int = 1536

    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "sprout_kb"

    admin_api_key: str = "change-me"
    chat_api_key: str = ""
    cors_origins: str = "http://localhost:5173,http://localhost:3001"

    top_k: int = 5
    score_threshold: float = 0.25
    chunk_size: int = 900
    chunk_overlap: int = 150
    max_history_turns: int = 6

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
