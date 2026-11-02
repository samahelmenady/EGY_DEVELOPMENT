"""
core/config.py — Centralised application configuration.

All environment variables are read exactly once here and exposed through a
single `settings` object that can be imported anywhere:

    from core.config import settings

    settings.gemini_api_key
    settings.session_ttl_seconds
    settings.model_path

Design decisions
----------------
- pydantic-settings is used so that every field is type-validated and the
  .env file is parsed automatically.
- All field names are lowercase in Python; pydantic-settings maps them to
  the uppercase env-var names automatically (case_sensitive=False).
- model_path is a @computed_field so it stays inside the Settings class
  rather than floating at module level.
- A single module-level `settings` singleton is created at import time so
  the cost of parsing .env is paid once.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root: core/config.py → parents[0]=core/ → parents[1]=project root
_PROJECT_ROOT: Path = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    """
    Application-wide configuration loaded from environment / .env file.

    Environment variable names are the UPPERCASE equivalents of the field names,
    e.g.  gemini_api_key  →  GEMINI_API_KEY  in the .env file.
    """

    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",          # silently ignore unknown env vars
        case_sensitive=False,    # GEMINI_API_KEY == gemini_api_key
    )

    # ── Gemini backend ────────────────────────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"

    # ── OpenAI-compatible backend (Groq / OpenRouter) ─────────────────────
    llm_provider: str = "groq"         # "groq" | "openrouter"
    llm_model: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    llm_base_url: str = ""             # optional override; empty = use provider default

    # ── Session management ────────────────────────────────────────────────
    session_ttl_seconds: int = 1800    # 30 minutes

    # ── Computed paths (not from env) ─────────────────────────────────────
    @computed_field
    @property
    def project_root(self) -> Path:
        return _PROJECT_ROOT

    @computed_field
    @property
    def model_path(self) -> Path:
        """Absolute path to final_price_prediction_model.joblib."""
        return _PROJECT_ROOT / "models" / "regression" / "final_price_prediction_model.joblib"

    @computed_field
    @property
    def env_path(self) -> Path:
        """Absolute path to .env file."""
        return _PROJECT_ROOT / ".env"

    # ── Derived helpers ───────────────────────────────────────────────────
    @property
    def use_gemini(self) -> bool:
        """True when a Gemini API key is present → GeminiClient should be used."""
        return bool(self.gemini_api_key.strip())

    @property
    def openai_api_key(self) -> str:
        """
        Returns whichever OpenAI-compatible key is available.
        Groq takes priority when both are set.
        """
        if self.llm_provider == "groq":
            return self.groq_api_key.strip()
        return self.openrouter_api_key.strip()

    @property
    def resolved_base_url(self) -> str:
        """Return explicit base_url override, or the provider default."""
        if self.llm_base_url.strip():
            return self.llm_base_url.strip()
        _defaults = {
            "groq": "https://api.groq.com/openai/v1",
            "openrouter": "https://openrouter.ai/api/v1",
        }
        return _defaults.get(self.llm_provider, "")


# ── Singleton ─────────────────────────────────────────────────────────────────
# Instantiated once at import time; re-used everywhere via
#   from core.config import settings
settings: Settings = Settings()

