"""
chat_engine.py — ChatSession and LLM client abstractions for ADV_ML_02 chatbot.

Design goals
------------
- Backend-ready: imported by FastAPI as-is; no notebook-only code.
- SDK-agnostic internally: GeminiClient wraps google-genai 1.x.
- FakeLLMClient enables deterministic unit tests without API calls.
- ChatSession owns conversation state, the tool-call loop and grounding checks.

Public API
----------
    load_env()                          -> (api_key, model_name)
    LLMClient                           abstract base
    GeminiClient(LLMClient)             real Gemini backend
    FakeLLMClient(LLMClient)            scripted test backend
    ChatSession(session_id, ...)        one conversation
        .send(user_message) -> dict
        .reset()
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment helpers
# ---------------------------------------------------------------------------

def load_env(env_path: str | Path | None = None) -> tuple[str, str]:
    """
    Load GEMINI_API_KEY and GEMINI_MODEL from a .env file using python-dotenv.

    Parameters
    ----------
    env_path : path-like, optional
        Path to the .env file. Defaults to PROJECT_ROOT/.env (two levels above
        src/chatbot/).

    Returns
    -------
    (api_key, model_name) : tuple[str, str]

    Raises
    ------
    EnvironmentError
        If GEMINI_API_KEY or GEMINI_MODEL is missing from the environment after
        loading the .env file.
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
        # src/chatbot/chat_engine.py -> src/chatbot -> src -> project root
        env_path = Path(__file__).resolve().parents[2] / ".env"

    load_dotenv(dotenv_path=env_path, override=False)

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    model_name = os.environ.get("GEMINI_MODEL", "").strip()

    missing = [k for k, v in [("GEMINI_API_KEY", api_key), ("GEMINI_MODEL", model_name)] if not v]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variable(s): {', '.join(missing)}. "
            f"Please set them in your .env file at: {env_path}"
        )

    return api_key, model_name


# ---------------------------------------------------------------------------
# Abstract LLM client
# ---------------------------------------------------------------------------

class LLMClient(ABC):
    """
    Abstract base class for LLM backends.

    All subclasses must implement `generate()` and return a normalized response
    dict so ChatSession can remain backend-agnostic.
    """

    @abstractmethod
    def generate(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
        **kwargs: Any,
    ) -> dict:
        """
        Send messages to the LLM and return a normalized response.

        Parameters
        ----------
        messages : list[dict]
            Conversation history. Each dict has keys ``role`` (str) and
            ``parts`` (list[dict]).  Parts are either
            ``{"type": "text", "text": str}`` or
            ``{"type": "function_call", "name": str, "args": dict, "id": str}`` or
            ``{"type": "function_response", "name": str, "id": str, "response": dict}``.
        tools : list[dict]
            Tool declarations in the project's internal format (as returned by
            ``build_tool_declarations()``).
        system : str
            System prompt text.
        **kwargs
            Extra generation parameters (temperature, max_output_tokens, …).

        Returns
        -------
        dict with keys:
            ``parts``   : list[dict] — same part schema as *messages*
            ``usage``   : dict — token counts (prompt_tokens, candidates_tokens,
                          total_tokens); may be empty.
        """
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Gemini client (google-genai 1.x)
# ---------------------------------------------------------------------------

class GeminiClient(LLMClient):
    """
    LLM client backed by ``google-genai`` (>= 1.0).

    Parameters
    ----------
    api_key : str
        Gemini API key.  NEVER logged or stored in outputs.
    model_name : str
        Model identifier, e.g. ``"gemini-2.0-flash"``.
    timeout : float
        HTTP timeout in seconds for each API call.
    """

    _MAX_RETRIES = 3
    _RETRY_BASE_DELAY = 2.0   # seconds; doubles each retry

    def __init__(self, api_key: str, model_name: str, timeout: float = 60.0) -> None:
        if not api_key:
            raise ValueError(
                "api_key is empty. Set GEMINI_API_KEY in your .env file."
            )
        self._model_name = model_name
        self._timeout = timeout

        try:
            import google.genai as genai
            import google.genai.types as t
        except ImportError as exc:
            raise ImportError(
                "google-genai is required. Install it with: pip install google-genai"
            ) from exc

        self._genai = genai
        self._types = t
        # api_key is passed directly to Client; never stored as a readable attribute
        self._client = genai.Client(api_key=api_key)

        # Verify model availability (best-effort; warn but don't crash)
        self._verify_model()

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
        Call the Gemini API with exponential-backoff retry on transient errors.

        Tool selection and schema compaction are applied automatically before
        every API call to keep request size well below Gemini's processing
        deadline.  See ``_select_tools()`` and ``_compact_decl()`` for details.
        """
        t = self._types
        sdk_contents = [self._to_sdk_content(m) for m in messages]
        # Apply tool selection first (reduces number of tools sent),
        # then compact each schema (removes redundant metadata).
        active_tools = self._select_tools(messages, tools)
        sdk_tools = self._build_sdk_tools(active_tools)

        config = t.GenerateContentConfig(
            system_instruction=system,
            tools=sdk_tools,
            tool_config=t.ToolConfig(
                function_calling_config=t.FunctionCallingConfig(
                    mode=t.FunctionCallingConfigMode.AUTO,
                )
            ),
            # Disable the SDK's built-in Automatic Function Calling (AFC) loop.
            # ChatSession owns the tool-call loop; the SDK must never execute tools.
            #
            # Why both fields are required:
            #   - `disable=True` alone is not sufficient in google-genai >= 2.x.
            #     `should_disable_afc()` returns True only when `disable=True` is
            #     set AND `maximum_remote_calls` is not explicitly in model_fields_set
            #     with a positive value.  Setting `maximum_remote_calls=0` triggers
            #     the separate early-exit branch in `should_disable_afc()` that checks
            #     `<= 0`, which is guaranteed to return True across all SDK versions.
            #   - Together they ensure `generate_content()` always takes the
            #     direct `_generate_content()` path with no AFC iteration.
            automatic_function_calling=t.AutomaticFunctionCallingConfig(
                disable=True,
                maximum_remote_calls=0,
            ),
            # Wire the per-request timeout through the SDK's HttpOptions.
            # `self._timeout` is stored in seconds; HttpOptions.timeout is in ms.
            # Without this, httpx uses no timeout and the call hangs indefinitely
            # if the server stalls or the model name is invalid.
            http_options=t.HttpOptions(timeout=int(self._timeout * 1000)),
            temperature=kwargs.get("temperature", 0.2),
            max_output_tokens=kwargs.get("max_output_tokens", 2048),
        )

        last_exc: Exception | None = None
        for attempt in range(self._MAX_RETRIES):
            try:
                response = self._client.models.generate_content(
                    model=self._model_name,
                    contents=sdk_contents,
                    config=config,
                )
                return self._normalize_response(response)
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                err_str = str(exc).lower()
                is_transient = any(
                    k in err_str
                    for k in ("429", "rate", "quota", "503", "timeout", "deadline")
                )
                if not is_transient or attempt == self._MAX_RETRIES - 1:
                    raise
                delay = self._RETRY_BASE_DELAY * (2 ** attempt)
                logger.warning(
                    "Gemini API transient error (attempt %d/%d): %s — retrying in %.1fs",
                    attempt + 1, self._MAX_RETRIES, exc, delay,
                )
                time.sleep(delay)

        raise last_exc  # type: ignore[misc]

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _verify_model(self) -> None:
        """Raise ValueError if the configured model is not in the available models list.

        This prevents a silent hang: an invalid model name would otherwise cause
        the HTTP request to block indefinitely (or fail after a very long wait)
        with no useful error message.  We fail fast here at construction time so
        the caller sees a clear exception before any user turn is attempted.

        Network failures during the list call are still treated as non-fatal so
        that transient connectivity issues at startup do not break the session.
        """
        try:
            available = [m.name for m in self._client.models.list()]
            if not any(self._model_name in name for name in available):
                raise ValueError(
                    f"Configured model '{self._model_name}' was not found in "
                    f"the Gemini API model list. "
                    f"Check GEMINI_MODEL in your .env file. "
                    f"Available models (first 10): {available[:10]}"
                )
            logger.info("Model '%s' confirmed available.", self._model_name)
        except ValueError:
            raise  # re-raise the model-not-found error unchanged
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not list models (non-fatal): %s", exc)

    def _build_sdk_tools(self, tool_declarations: list[dict]) -> list:
        """Convert compacted tool declaration dicts to SDK Tool objects.

        Each declaration is run through ``_compact_decl()`` before conversion so
        that verbose descriptions and duplicate ``oneOf`` enum branches are
        stripped.  The underlying tool functions and parameter names are not
        affected — only the schema metadata sent to Gemini is reduced.
        """
        t = self._types
        fn_decls = []
        for decl in tool_declarations:
            compact = self._compact_decl(decl)
            params = compact.get("parameters", {})
            fn_decls.append(
                t.FunctionDeclaration(
                    name=compact["name"],
                    description=compact.get("description", ""),
                    parameters=t.Schema(**self._build_schema(params)),
                )
            )
        return [t.Tool(function_declarations=fn_decls)]

    # ------------------------------------------------------------------
    # Tool selection
    # ------------------------------------------------------------------

    # Tools that are always included.
    _TOOLS_ALWAYS = frozenset({"search_properties", "resolve_location"})

    # Tools added once there is at least one prior tool-call round in history.
    _TOOLS_EXTENDED = frozenset({"suggest_next_question", "get_breakdown", "get_similar"})

    # Tool added only when the last search returned 0 results.
    _TOOL_RELAX = "relax_filters"

    def _select_tools(
        self, messages: list[dict], tools: list[dict]
    ) -> list[dict]:
        """Return the minimal subset of tools needed for the current turn.

        Strategy
        --------
        - The two core tools (``search_properties``, ``resolve_location``) are
          always included because every turn may require a new search or
          location resolution.
        - ``suggest_next_question``, ``get_breakdown``, ``get_similar`` are
          added after the first tool-call round (i.e. once the model has
          already done at least one search and there are function-response
          messages in history).
        - ``relax_filters`` replaces the extended set when the most-recent
          ``search_properties`` result has ``count == 0`` — there is no point
          offering breakdown or similar listings when there are no matches.
        - If history analysis fails for any reason the full tool list is
          returned unchanged (safe fallback).

        This reduces first-turn tool tokens from ~4,945 to ~812 (83% drop).
        """
        try:
            has_fn_response = False
            last_search_count: int | None = None

            for msg in messages:
                for part in msg.get("parts", []):
                    if part.get("type") == "function_response":
                        has_fn_response = True
                        if part.get("name") == "search_properties":
                            cnt = part.get("response", {}).get("count")
                            if cnt is not None:
                                last_search_count = int(cnt)

            if not has_fn_response:
                # First turn — only need search and location resolution.
                needed = self._TOOLS_ALWAYS
            elif last_search_count == 0:
                # Zero results — offer relaxation only; narrowing tools irrelevant.
                needed = self._TOOLS_ALWAYS | {self._TOOL_RELAX}
            else:
                # Normal mid-conversation — full set except relax.
                needed = self._TOOLS_ALWAYS | self._TOOLS_EXTENDED

            selected = [d for d in tools if d["name"] in needed]
            if not selected:
                return tools  # fallback: never send empty list
            return selected

        except Exception as exc:  # noqa: BLE001
            logger.debug("_select_tools fallback (non-fatal): %s", exc)
            return tools

    # ------------------------------------------------------------------
    # Schema compaction
    # ------------------------------------------------------------------

    # Descriptions to strip entirely from filter-level leaf properties.
    # These fields are self-explanatory from their names + enum values alone.
    _FILTER_STRIP_DESC = frozenset({
        "category", "property_type", "city", "district", "area",
        "min_price", "max_price", "bedrooms", "min_size", "max_size",
    })

    # Shortened amenities description — keeps the must-have-ALL rule but
    # removes the residential/commercial guidance (handled by system prompt).
    _AMENITIES_DESC_SHORT = "Property MUST have ALL listed amenities."

    # Shortened tool-level descriptions — one sentence each, covering the
    # essential call-condition so Gemini picks the right tool.
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

    def _compact_decl(self, decl: dict) -> dict:
        """Return a compacted copy of one tool declaration.

        Transformations applied (none affect parameter names or validation):
        1. Tool description shortened to one sentence.
        2. Descriptions stripped from self-explanatory filter leaf properties.
        3. ``amenities`` description shortened to the essential rule.
        4. ``property_type`` ``oneOf`` [{string enum}, {array items enum}]
           collapsed to a plain ``{"type": "string", "enum": [...]}`` —
           the Python tool functions accept both str and list; Gemini only
           needs to know the valid string values to call the function correctly.
        """
        import copy

        d: dict = copy.deepcopy(decl)

        # 1. Shorten tool-level description.
        short_desc = self._TOOL_DESC_SHORT.get(d["name"])
        if short_desc:
            d["description"] = short_desc

        # 2-4. Compact filter properties wherever they appear as a parameter.
        params_props = d.get("parameters", {}).get("properties", {})
        for pname, pdef in params_props.items():
            if pname == "filters" and "properties" in pdef:
                pdef["properties"] = self._compact_filter_props(pdef["properties"])

        return d

    def _compact_filter_props(self, fp: dict) -> dict:
        """Strip redundant metadata from filter-schema property definitions.

        Returns a new dict — never mutates the input (which is a module-level
        shared object in TOOL_DECLARATIONS).
        """
        import copy

        out: dict = {}
        for fname, fdef in fp.items():
            fdef = copy.deepcopy(fdef)

            # Strip description from self-explanatory fields.
            if fname in self._FILTER_STRIP_DESC:
                fdef.pop("description", None)

            # Shorten amenities description.
            if fname == "amenities" and "description" in fdef:
                fdef["description"] = self._AMENITIES_DESC_SHORT

            # Collapse property_type oneOf → plain string enum.
            # The tool functions internally call .tolist() / handle str inputs,
            # so sending only the string variant is valid.
            if fname == "property_type" and "oneOf" in fdef:
                for branch in fdef["oneOf"]:
                    if branch.get("type") == "string":
                        fdef = {"type": "string", "enum": branch["enum"]}
                        break

            out[fname] = fdef
        return out

    def _build_schema(self, schema_dict: dict) -> dict:
        """
        Recursively convert a JSON-Schema-style dict to keyword args
        accepted by ``google.genai.types.Schema``.

        Uses ``t.Type`` (not ``t.JSONSchemaType``) for the ``type`` field.
        ``Schema.type`` is typed as ``google.genai.types.Type``; passing a
        ``JSONSchemaType`` enum value causes a Pydantic validation error when
        the schema is nested inside another Schema object.
        """
        t = self._types
        result: dict[str, Any] = {}

        type_map = {
            "string": t.Type.STRING,
            "number": t.Type.NUMBER,
            "integer": t.Type.INTEGER,
            "boolean": t.Type.BOOLEAN,
            "array": t.Type.ARRAY,
            "object": t.Type.OBJECT,
        }

        raw_type = schema_dict.get("type", "")
        if raw_type in type_map:
            result["type"] = type_map[raw_type]

        if "description" in schema_dict:
            result["description"] = schema_dict["description"]
        if "enum" in schema_dict:
            result["enum"] = [str(e) for e in schema_dict["enum"]]
        if "required" in schema_dict:
            result["required"] = schema_dict["required"]

        if "properties" in schema_dict:
            result["properties"] = {
                k: t.Schema(**self._build_schema(v))
                for k, v in schema_dict["properties"].items()
            }

        if "items" in schema_dict:
            result["items"] = t.Schema(**self._build_schema(schema_dict["items"]))

        return result

    def _to_sdk_content(self, message: dict):
        """Convert an internal history message dict to a genai Content object."""
        t = self._types
        role = message["role"]
        parts = []
        for part in message.get("parts", []):
            p_type = part.get("type")
            if p_type == "text":
                parts.append(t.Part(text=part["text"]))
            elif p_type == "function_call":
                parts.append(
                    t.Part(
                        function_call=t.FunctionCall(
                            name=part["name"],
                            args=part.get("args", {}),
                            id=part.get("id"),
                        )
                    )
                )
            elif p_type == "function_response":
                parts.append(
                    t.Part(
                        function_response=t.FunctionResponse(
                            name=part["name"],
                            id=part.get("id"),
                            response=part.get("response", {}),
                        )
                    )
                )
        return t.Content(role=role, parts=parts)

    def _normalize_response(self, response) -> dict:
        """Convert a GenerateContentResponse to the internal dict format."""
        parts: list[dict] = []
        candidate = response.candidates[0] if response.candidates else None
        if candidate and candidate.content:
            for p in candidate.content.parts:
                if p.function_call:
                    fc = p.function_call
                    parts.append(
                        {
                            "type": "function_call",
                            "name": fc.name,
                            "args": dict(fc.args) if fc.args else {},
                            "id": fc.id or str(uuid.uuid4()),
                        }
                    )
                elif p.text:
                    parts.append({"type": "text", "text": p.text})

        usage: dict = {}
        if response.usage_metadata:
            um = response.usage_metadata
            usage = {
                "prompt_tokens": um.prompt_token_count or 0,
                "candidates_tokens": um.candidates_token_count or 0,
                "total_tokens": um.total_token_count or 0,
            }

        return {"parts": parts, "usage": usage}


# ---------------------------------------------------------------------------
# FakeLLMClient — for deterministic tests
# ---------------------------------------------------------------------------

class FakeLLMClient(LLMClient):
    """
    Scripted LLM client for unit tests.  Pops responses from a script list
    in order; raises ``IndexError`` if the script is exhausted.

    Parameters
    ----------
    script : list[dict]
        Each item may have:
        ``"tool_calls"`` : list[dict] — each with ``"name"`` and ``"args"``
        ``"text"``       : str        — final text reply
        Both may be present in the same item (tool calls take priority for that
        step, but if only ``"text"`` is present it's returned directly).

    Example
    -------
    ::

        client = FakeLLMClient([
            {"tool_calls": [{"name": "search_properties",
                             "args": {"filters": {"category": "buy"}}}]},
            {"text": "I found 1234 properties for sale."},
        ])
    """

    def __init__(self, script: list[dict]) -> None:
        self._script = list(script)

    def generate(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
        **kwargs: Any,
    ) -> dict:
        if not self._script:
            raise IndexError("FakeLLMClient script is exhausted — no more responses queued.")

        item = self._script.pop(0)
        parts: list[dict] = []

        for tc in item.get("tool_calls", []):
            parts.append(
                {
                    "type": "function_call",
                    "name": tc["name"],
                    "args": tc.get("args", {}),
                    "id": str(uuid.uuid4()),
                }
            )

        if not parts and "text" in item:
            parts.append({"type": "text", "text": item["text"]})
        elif "text" in item:
            # Append text after tool calls (simulates mixed parts)
            parts.append({"type": "text", "text": item["text"]})

        return {"parts": parts, "usage": {}}


# ---------------------------------------------------------------------------
# Tool executor
# ---------------------------------------------------------------------------

def _execute_tool(name: str, args: dict) -> tuple[Any, float]:
    """
    Call the named tool from src.chatbot.tools and return (result, elapsed_ms).

    All exceptions are caught and returned as ``{"error": str(exc)}``.
    """
    from src.chatbot import tools as _tools  # lazy import keeps module lightweight

    fn = getattr(_tools, name, None)
    if fn is None:
        return {"error": f"Unknown tool: {name}"}, 0.0

    t0 = time.perf_counter()
    try:
        result = fn(**args)
    except Exception as exc:  # noqa: BLE001
        result = {"error": str(exc)}
    elapsed_ms = (time.perf_counter() - t0) * 1000
    return result, elapsed_ms


# ---------------------------------------------------------------------------
# Grounding checker
# ---------------------------------------------------------------------------

_NUMBER_RE = re.compile(r"\b\d[\d,. ]*\d\b|\b\d\b")


def _grounding_check(reply: str, tool_results: list[dict]) -> bool:
    """
    Return True if the reply contains any number NOT found in any tool result.

    Uses a simple string-matching heuristic: extract all digit-containing
    tokens from the reply, then check each against the stringified tool results.
    Suitable for a lightweight sanity check (not a full proof of grounding).
    """
    if not tool_results:
        return False

    # Build a single string of all tool results for membership checks
    results_blob = " ".join(json.dumps(r, ensure_ascii=False, default=str) for r in tool_results)

    numbers_in_reply = _NUMBER_RE.findall(reply)
    for raw in numbers_in_reply:
        # Normalize: strip spaces/commas for comparison
        normalized = re.sub(r"[ ,]", "", raw)
        if normalized and normalized not in results_blob:
            return True   # found an ungrounded number

    return False


# ---------------------------------------------------------------------------
# ChatSession
# ---------------------------------------------------------------------------

class ChatSession:
    """
    One conversation with a user.

    Parameters
    ----------
    session_id : str
        Unique identifier for this session (used in logs and exports).
    user_profile : dict, optional
        Pre-filled user preferences (injected into the system prompt via
        ``user_profile_section``).
    llm_client : LLMClient, optional
        Defaults to ``GeminiClient`` loaded from the project .env.  Pass a
        ``FakeLLMClient`` for tests.
    max_history : int
        Maximum number of *turns* (user+model pairs) kept in memory.
    """

    _MAX_TOOL_ROUNDS = 5

    def __init__(
        self,
        session_id: str | None = None,
        user_profile: dict | None = None,
        llm_client: LLMClient | None = None,
        max_history: int = 10,
    ) -> None:
        self.session_id: str = session_id or str(uuid.uuid4())
        self.user_profile: dict = user_profile or {}
        self.max_history: int = max_history

        # Conversation history in the internal format
        self._history: list[dict] = []

        # Accumulated filter state across turns
        self.state: dict = {}
        if user_profile:
            # Pre-fill state from profile (only recognised filter keys)
            _filter_keys = {
                "category", "property_type", "governorate", "city", "district",
                "bedrooms", "price_min", "price_max", "amenities",
            }
            for k in _filter_keys:
                if k in user_profile:
                    self.state[k] = user_profile[k]

        # Last tool results for grounding check
        self._last_tool_results: list[dict] = []

        # Metrics per turn
        self.metrics: list[dict] = []

        # Build system prompt
        from src.chatbot.prompts import SYSTEM_PROMPT, user_profile_section

        profile_block = user_profile_section(self.user_profile)
        self._system_prompt: str = (
            SYSTEM_PROMPT + "\n\n" + profile_block if profile_block else SYSTEM_PROMPT
        )

        # LLM client
        if llm_client is not None:
            self._llm: LLMClient = llm_client
        else:
            api_key, model_name = load_env()
            self._llm = GeminiClient(api_key=api_key, model_name=model_name)

        # Tool declarations (lazy-loaded once per process)
        from src.chatbot.tools import TOOL_DECLARATIONS

        self._tools: list[dict] = TOOL_DECLARATIONS

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def send(self, user_message: str) -> dict:
        """
        Process one user message and return the chatbot response dict.

        Returns
        -------
        dict with keys:
            ``reply``           : str   — final text reply from the model
            ``tool_calls``      : list  — list of {name, args, ok, result, ms}
            ``properties``      : list  — property dicts from last search (may be [])
            ``suggestions``     : list  — next question suggestions (strings)
            ``grounding_warn``  : bool  — True if a number in reply looks ungrounded
            ``usage``           : dict  — token counts (summed across rounds)
            ``turn_ms``         : float — total wall-clock time for this turn (ms)
        """
        turn_start = time.perf_counter()
        self._history.append({"role": "user", "parts": [{"type": "text", "text": user_message}]})

        tool_call_log: list[dict] = []
        self._last_tool_results = []
        last_search_result: dict | None = None
        total_usage: dict = {"prompt_tokens": 0, "candidates_tokens": 0, "total_tokens": 0}
        reply_text = ""

        for round_idx in range(self._MAX_TOOL_ROUNDS):
            response = self._llm.generate(
                messages=self._history,
                tools=self._tools,
                system=self._system_prompt,
            )

            # Accumulate token usage
            for k in total_usage:
                total_usage[k] += response.get("usage", {}).get(k, 0)

            parts = response.get("parts", [])
            fn_call_parts = [p for p in parts if p.get("type") == "function_call"]
            text_parts = [p for p in parts if p.get("type") == "text"]

            if not fn_call_parts:
                # No tool calls — model produced final text
                reply_text = " ".join(p["text"] for p in text_parts).strip()
                # Append model reply to history
                self._history.append({"role": "model", "parts": parts})
                break

            # Execute each tool call
            fn_response_parts: list[dict] = []
            for fc in fn_call_parts:
                name = fc["name"]
                args = fc.get("args", {})
                call_id = fc.get("id", str(uuid.uuid4()))

                result, elapsed_ms = _execute_tool(name, args)
                ok = "error" not in result

                tool_call_log.append(
                    {
                        "round": round_idx,
                        "name": name,
                        "args": args,
                        "ok": ok,
                        "result": result,
                        "ms": round(elapsed_ms, 2),
                    }
                )
                self._last_tool_results.append(result)

                # State management: merge filters from search_properties
                if name == "search_properties" and ok:
                    self._merge_state(args.get("filters", {}))
                    last_search_result = result

                fn_response_parts.append(
                    {
                        "type": "function_response",
                        "name": name,
                        "id": call_id,
                        "response": result if ok else {"error": result.get("error", "unknown error")},
                    }
                )

            # Add the model's function call parts to history
            self._history.append({"role": "model", "parts": fn_call_parts})
            # Add function responses as user turn
            self._history.append({"role": "user", "parts": fn_response_parts})

        else:
            # Reached round cap — ask model to summarise with what it has
            self._history.append(
                {
                    "role": "user",
                    "parts": [
                        {
                            "type": "text",
                            "text": (
                                "Please give the user a helpful summary based on what "
                                "you have gathered so far."
                            ),
                        }
                    ],
                }
            )
            cap_resp = self._llm.generate(
                messages=self._history,
                tools=self._tools,
                system=self._system_prompt,
            )
            text_parts = [p for p in cap_resp.get("parts", []) if p.get("type") == "text"]
            reply_text = " ".join(p["text"] for p in text_parts).strip()
            self._history.append({"role": "model", "parts": cap_resp.get("parts", [])})

        # Trim history to max_history turns (each turn = user + model pair = 2 items)
        max_items = self.max_history * 2
        if len(self._history) > max_items:
            self._history = self._history[-max_items:]

        # Extract properties from last search_properties result
        properties: list[dict] = []
        if last_search_result and "results" in last_search_result:
            properties = last_search_result["results"]

        # suggest_next_question
        suggestions: list[str] = []
        try:
            from src.chatbot.tools import suggest_next_question

            sq_result = suggest_next_question(filters=self.state)
            suggestions = sq_result.get("suggestions", [])
        except Exception as exc:  # noqa: BLE001
            logger.debug("suggest_next_question failed (non-fatal): %s", exc)

        # Grounding check
        grounding_warn = _grounding_check(reply_text, self._last_tool_results)
        if grounding_warn:
            logger.warning(
                "Session %s: grounding check flagged a number in the reply that "
                "does not appear in tool results.",
                self.session_id,
            )

        turn_ms = (time.perf_counter() - turn_start) * 1000

        result_dict = {
            "reply": reply_text,
            "tool_calls": tool_call_log,
            "properties": properties,
            "suggestions": suggestions,
            "grounding_warn": grounding_warn,
            "usage": total_usage,
            "turn_ms": round(turn_ms, 2),
        }

        self.metrics.append(
            {
                "session_id": self.session_id,
                "turn": len(self.metrics) + 1,
                "user_message": user_message[:120],
                "tool_rounds": len({tc["round"] for tc in tool_call_log}),
                "tool_calls": len(tool_call_log),
                "properties_returned": len(properties),
                "grounding_warn": grounding_warn,
                "prompt_tokens": total_usage["prompt_tokens"],
                "candidates_tokens": total_usage["candidates_tokens"],
                "total_tokens": total_usage["total_tokens"],
                "turn_ms": round(turn_ms, 2),
            }
        )

        return result_dict

    def reset(self) -> None:
        """Clear history and state, keeping session_id and user_profile."""
        self._history = []
        self.state = {}
        self._last_tool_results = []
        self.metrics = []
        # Re-apply profile state if any
        if self.user_profile:
            _filter_keys = {
                "category", "property_type", "governorate", "city", "district",
                "bedrooms", "price_min", "price_max", "amenities",
            }
            for k in _filter_keys:
                if k in self.user_profile:
                    self.state[k] = self.user_profile[k]

    # ------------------------------------------------------------------
    # Private
    # ------------------------------------------------------------------

    def _merge_state(self, filters: dict) -> None:
        """
        Merge filters from a search_properties call into self.state.

        Handles:
        - Category change: clears bedrooms when switching to commercial,
          removes residential-only amenity codes.
        - Key removal: if a value is None, pop the key from state.
        """
        _RESIDENTIAL_AMENITY_CODES = {
            "BA", "SE", "BL", "AC", "BK", "BW", "SP", "SS", "WC",
            "ST", "CO", "PG", "VW", "MR", "PP",
        }
        _COMMERCIAL_CATEGORIES = {"commercial_buy", "commercial_rent"}

        new_category = filters.get("category")
        old_category = self.state.get("category")

        for k, v in filters.items():
            if v is None:
                self.state.pop(k, None)
            else:
                self.state[k] = v

        # If switching to commercial, clear residential-specific filters
        if (
            new_category in _COMMERCIAL_CATEGORIES
            and new_category != old_category
        ):
            self.state.pop("bedrooms", None)
            amenities = self.state.get("amenities", [])
            if amenities:
                self.state["amenities"] = [
                    code for code in amenities
                    if code not in _RESIDENTIAL_AMENITY_CODES
                ]
                if not self.state["amenities"]:
                    self.state.pop("amenities", None)

