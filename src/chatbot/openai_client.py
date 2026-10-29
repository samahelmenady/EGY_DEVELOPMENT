"""
openai_client.py — OpenAI-compatible LLM client for ADV_ML_02 chatbot.

Supports Groq, OpenRouter, and any OpenAI-compatible REST endpoint.
Uses httpx directly (no openai package required) so the module imports
cleanly even when the openai SDK is not installed.

Public API
----------
    load_env_openai()                   -> (api_key, model_name, provider, base_url)
    OpenAICompatibleClient(LLMClient)   real backend via OpenAI-compatible REST
"""

from __future__ import annotations

import copy
import json
import logging
import os
import re
import time
import uuid
from pathlib import Path
from typing import Any

from src.chatbot.chat_engine import LLMClient

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Known provider defaults
# ---------------------------------------------------------------------------

_PROVIDER_DEFAULTS: dict[str, dict[str, str]] = {
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "key_env":  "GROQ_API_KEY",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "key_env":  "OPENROUTER_API_KEY",
    },
}

# ---------------------------------------------------------------------------
# Environment helper
# ---------------------------------------------------------------------------


def load_env_openai(
    env_path: str | Path | None = None,
) -> tuple[str, str, str, str]:
    """
    Load OpenAI-compatible API credentials from a .env file.

    Parameters
    ----------
    env_path : path-like, optional
        Path to the .env file. Defaults to PROJECT_ROOT/.env
        (two levels above src/chatbot/).

    Returns
    -------
    (api_key, model_name, provider, base_url) : tuple[str, str, str, str]

    Raises
    ------
    EnvironmentError
        If required variables are missing.
    ImportError
        If python-dotenv is not installed.
    """
    try:
        from dotenv import load_dotenv
    except ImportError as exc:
        raise ImportError(
            "python-dotenv is required. Install it with: pip install python-dotenv"
        ) from exc

    if env_path is None:
        env_path = Path(__file__).resolve().parents[2] / ".env"

    load_dotenv(dotenv_path=env_path, override=False)

    provider = os.environ.get("LLM_PROVIDER", "groq").strip().lower()
    model_name = os.environ.get("LLM_MODEL", "").strip()

    # Determine base_url and api_key from provider
    defaults = _PROVIDER_DEFAULTS.get(provider)
    if defaults:
        base_url = os.environ.get("LLM_BASE_URL", defaults["base_url"]).strip()
        api_key = os.environ.get(defaults["key_env"], "").strip()
    else:
        # Custom / unknown provider — require explicit LLM_BASE_URL
        base_url = os.environ.get("LLM_BASE_URL", "").strip()
        api_key = (
            os.environ.get("OPENROUTER_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
        ).strip()

    missing: list[str] = []
    if not api_key:
        key_var = defaults["key_env"] if defaults else "GROQ_API_KEY or OPENROUTER_API_KEY"
        missing.append(key_var)
    if not model_name:
        missing.append("LLM_MODEL")
    if not base_url:
        missing.append("LLM_BASE_URL")

    if missing:
        raise EnvironmentError(
            f"Missing required environment variable(s): {', '.join(missing)}. "
            f"Please set them in your .env file at: {env_path}"
        )

    return api_key, model_name, provider, base_url


# ---------------------------------------------------------------------------
# OpenAI-compatible client (httpx-based)
# ---------------------------------------------------------------------------


class OpenAICompatibleClient(LLMClient):
    """
    LLM client backed by any OpenAI-compatible REST API (Groq, OpenRouter, …).

    Uses httpx directly — no openai package required.

    Parameters
    ----------
    api_key : str
        API key for the provider. NEVER logged or stored in outputs.
    model_name : str
        Model identifier, e.g. ``"llama-3.3-70b-versatile"`` (Groq) or
        ``"openai/gpt-4o-mini"`` (OpenRouter).
    base_url : str
        OpenAI-compatible endpoint, e.g. ``"https://api.groq.com/openai/v1"``.
    provider : str
        Provider name for logging only (``"groq"`` or ``"openrouter"``).
    timeout : float
        HTTP timeout in seconds for each API call. Default 60 s.
    extra_headers : dict, optional
        Additional HTTP headers. OpenRouter requires
        ``{"HTTP-Referer": "https://github.com/ADV_ML_02"}``.
    """

    _MAX_RETRIES = 3
    _RETRY_BASE_DELAY = 2.0   # seconds; doubles each retry

    def __init__(
        self,
        api_key: str,
        model_name: str,
        base_url: str,
        provider: str = "groq",
        timeout: float = 60.0,
        extra_headers: dict | None = None,
    ) -> None:
        if not api_key:
            raise ValueError(
                "api_key is empty. Set the provider API key in your .env file."
            )
        if not base_url:
            raise ValueError("base_url must not be empty.")

        self._model_name = model_name
        self._provider = provider
        self._timeout = timeout

        try:
            import httpx as _httpx
        except ImportError as exc:
            raise ImportError(
                "httpx is required. Install it with: pip install httpx"
            ) from exc

        # Build request headers (api_key is in Authorization; never stored as attribute)
        headers: dict[str, str] = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        # OpenRouter requires an HTTP-Referer header
        if provider == "openrouter":
            headers["HTTP-Referer"] = "https://github.com/ADV_ML_02"
            headers["X-Title"] = "ADV_ML_02 Chatbot"
        if extra_headers:
            headers.update(extra_headers)

        # Normalise base_url: strip trailing slash
        self._endpoint = base_url.rstrip("/") + "/chat/completions"

        self._http = _httpx.Client(
            headers=headers,
            timeout=_httpx.Timeout(timeout),
        )

        logger.info(
            "OpenAICompatibleClient ready — provider=%s model=%s",
            provider, model_name,
        )

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def generate(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
        **kwargs: Any,
    ) -> dict:
        """
        Call the OpenAI-compatible API with exponential-backoff retry.

        Converts the internal message/tool format to OpenAI format, sends the
        request via httpx, then normalises the response back to the internal
        ``{parts, usage}`` dict.
        """
        oai_messages = self._to_openai_messages(messages, system)
        # Apply dynamic tool selection and schema compaction to stay within TPM limits
        active_tools = self._select_tools(messages, tools) if tools else []
        oai_tools = self._to_openai_tools(active_tools) if active_tools else None

        payload: dict[str, Any] = {
            "model": self._model_name,
            "messages": oai_messages,
            "temperature": kwargs.get("temperature", 0.2),
            "max_tokens": kwargs.get("max_output_tokens", 2048),
        }
        if oai_tools:
            payload["tools"] = oai_tools
            payload["tool_choice"] = "auto"

        last_exc: Exception | None = None
        for attempt in range(self._MAX_RETRIES):
            try:
                resp = self._http.post(self._endpoint, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return self._normalize_response(data)
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                err_str = str(exc).lower()
                # httpx raises httpx.HTTPStatusError for 4xx/5xx
                status_code = (
                    getattr(getattr(exc, "response", None), "status_code", None)
                    or 0
                )
                is_transient = status_code in (429, 503) or any(
                    k in err_str
                    for k in ("429", "rate", "quota", "503", "timeout", "deadline")
                )
                if not is_transient or attempt == self._MAX_RETRIES - 1:
                    raise

                delay = self._RETRY_BASE_DELAY * (2 ** attempt)
                # Respect Retry-After header or Groq rate limit message
                resp_obj = getattr(exc, "response", None)
                if resp_obj is not None and status_code == 429:
                    ra_hdr = resp_obj.headers.get("retry-after")
                    if ra_hdr:
                        try:
                            delay = max(delay, float(ra_hdr))
                        except ValueError:
                            pass
                    else:
                        try:
                            err_msg = resp_obj.json().get("error", {}).get("message", "")
                            m = re.search(r"try again in ([0-9.]+)s", err_msg)
                            if m:
                                delay = max(delay, float(m.group(1)) + 0.5)
                        except Exception:
                            pass

                logger.warning(
                    "%s API transient error (attempt %d/%d): %s — retrying in %.1fs",
                    self._provider, attempt + 1, self._MAX_RETRIES, exc, delay,
                )
                time.sleep(delay)

        raise last_exc  # type: ignore[misc]

    # ------------------------------------------------------------------
    # Tool selection and schema compaction
    # ------------------------------------------------------------------

    _TOOLS_ALWAYS = frozenset({"search_properties", "resolve_location"})
    _TOOLS_EXTENDED = frozenset({"suggest_next_question", "get_breakdown", "get_similar"})
    _TOOL_RELAX = "relax_filters"

    _FILTER_STRIP_DESC = frozenset({
        "category", "property_type", "city", "district", "area",
        "min_price", "max_price", "bedrooms", "min_size", "max_size",
    })
    _AMENITIES_DESC_SHORT = "Property MUST have ALL listed amenities."

    _TOOL_DESC_SHORT: dict[str, str] = {
        "search_properties": (
            "Search Egyptian real estate with filters. "
            "Returns listings with price_label (EGP or EGP/month), image_url, share_url."
        ),
        "get_breakdown": (
            "Count and price stats grouped by one dimension "
            "(area/city/governorate/property_type/bedrooms/category)."
        ),
        "get_similar": (
            "Find listings similar to a given property_id using the recommendation model."
        ),
        "suggest_next_question": (
            "Identify the best unanswered filter to ask next. "
            "Never suggests bedrooms for commercial categories."
        ),
        "relax_filters": (
            "Loosen filters progressively when search_properties returns 0 results. "
            "Never relaxes category."
        ),
        "resolve_location": (
            "Translate Arabic or ambiguous location text to canonical "
            "governorate/city/district/area values."
        ),
    }

    def _select_tools(
        self, messages: list[dict], tools: list[dict]
    ) -> list[dict]:
        """Return the minimal subset of tools needed for the current turn."""
        try:
            has_fn_response = False
            last_search_count: int | None = None

            for msg in messages:
                for part in msg.get("parts", []):
                    if part.get("type") == "function_response":
                        has_fn_response = True
                        if part.get("name") == "search_properties":
                            resp_data = part.get("response", {})
                            cnt = resp_data.get("count") if "count" in resp_data else resp_data.get("total_matches")
                            if cnt is not None:
                                last_search_count = int(cnt)

            if not has_fn_response:
                needed = self._TOOLS_ALWAYS
            elif last_search_count == 0:
                needed = self._TOOLS_ALWAYS | {self._TOOL_RELAX}
            else:
                needed = self._TOOLS_ALWAYS | self._TOOLS_EXTENDED

            selected = [d for d in tools if d["name"] in needed]
            return selected if selected else tools
        except Exception as exc:  # noqa: BLE001
            logger.debug("_select_tools fallback: %s", exc)
            return tools

    def _compact_decl(self, decl: dict) -> dict:
        """Return a compacted copy of one tool declaration."""
        d: dict = copy.deepcopy(decl)
        short_desc = self._TOOL_DESC_SHORT.get(d.get("name", ""))
        if short_desc:
            d["description"] = short_desc

        params_props = d.get("parameters", {}).get("properties", {})
        for pname, pdef in params_props.items():
            if pname == "filters" and "properties" in pdef:
                pdef["properties"] = self._compact_filter_props(pdef["properties"])
        return d

    def _compact_filter_props(self, fp: dict) -> dict:
        """Strip redundant metadata from filter-schema property definitions."""
        out: dict = {}
        for fname, fdef in fp.items():
            fdef = copy.deepcopy(fdef)
            if fname in self._FILTER_STRIP_DESC:
                fdef.pop("description", None)
            if fname == "amenities" and "description" in fdef:
                fdef["description"] = self._AMENITIES_DESC_SHORT
            if fname == "property_type" and "oneOf" in fdef:
                for branch in fdef["oneOf"]:
                    if branch.get("type") == "string":
                        fdef = {"type": "string", "enum": branch["enum"]}
                        break
            out[fname] = fdef
        return out

    # ------------------------------------------------------------------
    # Format converters
    # ------------------------------------------------------------------

    def _to_openai_messages(
        self, messages: list[dict], system: str
    ) -> list[dict]:
        """
        Convert internal history + system prompt → OpenAI messages list.

        Internal format
        ---------------
        [
            {"role": "user",  "parts": [{"type": "text", "text": "..."}]},
            {"role": "model", "parts": [
                {"type": "function_call", "name": "...", "args": {}, "id": "..."},
            ]},
            {"role": "user",  "parts": [
                {"type": "function_response", "name": "...", "id": "...", "response": {}},
            ]},
        ]

        OpenAI format
        -------------
        [
            {"role": "system",    "content": "..."},
            {"role": "user",      "content": "..."},
            {"role": "assistant", "content": null,
             "tool_calls": [{"id":..., "type":"function",
                             "function":{"name":..., "arguments":"..."}}]},
            {"role": "tool",      "tool_call_id": "...", "content": "..."},
        ]
        """
        result: list[dict] = [{"role": "system", "content": system}]

        for msg in messages:
            role = msg["role"]
            parts = msg.get("parts", [])

            # Classify parts
            fn_calls = [p for p in parts if p.get("type") == "function_call"]
            fn_responses = [p for p in parts if p.get("type") == "function_response"]
            text_parts = [p for p in parts if p.get("type") == "text"]

            if fn_responses:
                # Each function response becomes a separate "tool" role message
                for p in fn_responses:
                    resp_data = p.get("response", {})
                    # Compact listings in search results to keep prompt within token budget
                    if (
                        isinstance(resp_data, dict)
                        and "results" in resp_data
                        and isinstance(resp_data["results"], list)
                    ):
                        compact_resp = dict(resp_data)
                        keep_fields = {
                            "id", "title", "price", "price_label", "property_type",
                            "category", "location", "bedrooms", "bathrooms", "size"
                        }
                        compact_resp["results"] = [
                            {k: v for k, v in item.items() if k in keep_fields}
                            for item in resp_data["results"]
                        ]
                        content_str = json.dumps(compact_resp, ensure_ascii=False, default=str)
                    else:
                        content_str = json.dumps(resp_data, ensure_ascii=False, default=str)

                    result.append({
                        "role": "tool",
                        "tool_call_id": p.get("id", str(uuid.uuid4())),
                        "content": content_str,
                    })

            elif fn_calls:
                # Assistant message with tool_calls list
                oai_tool_calls = []
                for p in fn_calls:
                    oai_tool_calls.append({
                        "id": p.get("id", str(uuid.uuid4())),
                        "type": "function",
                        "function": {
                            "name": p["name"],
                            "arguments": json.dumps(
                                p.get("args", {}), ensure_ascii=False
                            ),
                        },
                    })
                # Include any trailing text in content (rare but possible)
                content = (
                    " ".join(p["text"] for p in text_parts).strip() or None
                )
                result.append({
                    "role": "assistant",
                    "content": content,
                    "tool_calls": oai_tool_calls,
                })

            else:
                # Plain text message
                text = " ".join(p["text"] for p in text_parts).strip()
                oai_role = "assistant" if role == "model" else "user"
                result.append({"role": oai_role, "content": text})

        return result

    def _to_openai_tools(self, tool_declarations: list[dict]) -> list[dict]:
        """
        Convert internal TOOL_DECLARATIONS → OpenAI tools list.

        Internal format: [{name, description, parameters: {type, properties, required}}]
        OpenAI format:   [{"type": "function", "function": {name, description, parameters}}]

        Each declaration is compacted to reduce schema tokens while preserving
        all required properties and parameter names.
        """
        return [
            {"type": "function", "function": self._compact_decl(decl)}
            for decl in tool_declarations
        ]

    # ------------------------------------------------------------------
    # Response normaliser
    # ------------------------------------------------------------------

    def _normalize_response(self, data: dict) -> dict:
        """
        Convert an OpenAI-format API response dict to the internal
        ``{parts, usage}`` format expected by ChatSession.

        OpenAI response shape
        ---------------------
        {
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": "...",          # text reply (may be null)
                    "tool_calls": [            # may be absent
                        {"id": "...", "type": "function",
                         "function": {"name": "...", "arguments": "..."}},
                    ],
                }
            }],
            "usage": {
                "prompt_tokens": ...,
                "completion_tokens": ...,
                "total_tokens": ...,
            }
        }
        """
        parts: list[dict] = []

        choices = data.get("choices", [])
        if choices:
            msg = choices[0].get("message", {})

            # Tool calls take priority
            tool_calls = msg.get("tool_calls") or []
            for tc in tool_calls:
                fn = tc.get("function", {})
                try:
                    args = json.loads(fn.get("arguments", "{}"))
                except json.JSONDecodeError:
                    args = {}
                parts.append({
                    "type": "function_call",
                    "name": fn.get("name", ""),
                    "args": args,
                    "id": tc.get("id", str(uuid.uuid4())),
                })

            # Text content (may coexist with tool calls)
            content = msg.get("content") or ""
            if content:
                parts.append({"type": "text", "text": content})

        raw_usage = data.get("usage", {})
        usage: dict = {
            "prompt_tokens":     raw_usage.get("prompt_tokens", 0),
            "candidates_tokens": raw_usage.get("completion_tokens", 0),
            "total_tokens":      raw_usage.get("total_tokens", 0),
        }

        return {"parts": parts, "usage": usage}

    # ------------------------------------------------------------------
    # Cleanup
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close the underlying httpx client. Call when done with the session."""
        self._http.close()

    def __enter__(self) -> "OpenAICompatibleClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()

