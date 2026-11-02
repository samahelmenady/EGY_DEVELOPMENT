"""
core/startup.py — Application-level startup helpers.

Two responsibilities:
  1. load_price_model()  — loads the regression model from disk once at startup.
  2. build_llm_client()  — uses `settings` from core.config to construct
                           the appropriate LLM client.

Both functions are called from the FastAPI lifespan in app.py. Their results
are stored in app.state so every request handler can access them without
re-loading anything.
"""
from __future__ import annotations

import logging

from core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Regression model
# ---------------------------------------------------------------------------

def load_price_model():
    """
    Load final_price_prediction_model.joblib from settings.model_path.

    The model is a StackingRegressor (scikit-learn 1.9.1 + xgboost).
    Expected feature columns (from model.feature_names_in_):
        ['size', 'bedrooms', 'bathrooms', 'latitude', 'longitude',
         'property_type', 'category']

    Raises
    ------
    FileNotFoundError
        If the .joblib file is missing.
    ModuleNotFoundError
        If xgboost is not installed in the active environment — the project
        venv (.venv) has xgboost; the global Python interpreter does not.
    """
    import joblib

    path = settings.model_path
    if not path.exists():
        raise FileNotFoundError(
            f"Regression model not found at: {path}\n"
            "Ensure models/regression/final_price_prediction_model.joblib exists."
        )

    logger.info("Loading regression model from %s …", path)
    model = joblib.load(str(path))
    logger.info(
        "Regression model loaded — type=%s, features=%s",
        type(model).__name__,
        list(getattr(model, "feature_names_in_", [])),
    )
    return model


# ---------------------------------------------------------------------------
# LLM client
# ---------------------------------------------------------------------------

def build_llm_client():
    """
    Construct and return a ready-to-use LLM client using `settings`.

    Selection priority:
      1. If settings.use_gemini is True  → GeminiClient
         (verifies model availability via the Gemini API at construction time)
      2. Otherwise                       → OpenAICompatibleClient
         (Groq or OpenRouter, depending on settings.llm_provider)

    Returns
    -------
    LLMClient  (GeminiClient | OpenAICompatibleClient)

    Raises
    ------
    EnvironmentError
        Propagated from load_env / load_env_openai when required keys are missing.
    """
    if settings.use_gemini:
        logger.info(
            "LLM backend: GeminiClient — model='%s'", settings.gemini_model
        )
        from src.chatbot.chat_engine import GeminiClient

        client = GeminiClient(
            api_key=settings.gemini_api_key,
            model_name=settings.gemini_model,
        )
        logger.info("GeminiClient ready.")
        return client

    # OpenAI-compatible fallback (Groq / OpenRouter)
    api_key = settings.openai_api_key
    base_url = settings.resolved_base_url

    if not api_key:
        raise EnvironmentError(
            "Neither GEMINI_API_KEY nor GROQ_API_KEY / OPENROUTER_API_KEY is set. "
            "Add at least one API key to your .env file."
        )
    if not base_url:
        raise EnvironmentError(
            f"Cannot determine base_url for provider '{settings.llm_provider}'. "
            "Set LLM_BASE_URL in your .env file or use a supported provider (groq/openrouter)."
        )
    if not settings.llm_model:
        raise EnvironmentError(
            "LLM_MODEL is not set. Add it to your .env file (e.g. llama-3.3-70b-versatile)."
        )

    logger.info(
        "LLM backend: OpenAICompatibleClient — provider=%s, model=%s",
        settings.llm_provider,
        settings.llm_model,
    )
    from src.chatbot.openai_client import OpenAICompatibleClient

    client = OpenAICompatibleClient(
        api_key=api_key,
        model_name=settings.llm_model,
        base_url=base_url,
        provider=settings.llm_provider,
    )
    logger.info("OpenAICompatibleClient ready.")
    return client
