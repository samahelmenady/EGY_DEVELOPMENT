"""
api/chat.py — POST /api/chat

Handles all chatbot interaction requests. Each request:
  1. Retrieves or creates a ChatSession via SessionManager.
  2. Runs the blocking ChatSession.send() in a thread pool (anyio) so the
     FastAPI event loop is never blocked.
  3. Normalises the result into a clean ChatResponse.

Design notes
------------
- The LLM client and SessionManager are stored on app.state (set at startup).
- All exceptions are caught and returned as clean HTTP error responses;
  internal details are logged server-side only (never exposed to the client).
- The suggestions bug fix lives in chat_engine.py (sq_result["options"] key);
  this module adds a second defensive layer in case the list is malformed.
"""
from __future__ import annotations

import logging

import anyio
from fastapi import APIRouter, HTTPException, Request

from schemas import ChatRequest, ChatResponse, PropertyResult

router = APIRouter(prefix="/api", tags=["Chat"])
logger = logging.getLogger(__name__)


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the AI assistant",
    description=(
        "Send a user message and receive the assistant's reply, optional property "
        "cards, and next-question suggestions.  Include `session_id` (returned in "
        "the first response) on every subsequent request to preserve conversation "
        "history.  Omit it (or send `null`) to start a fresh session."
    ),
)
async def chat(req: ChatRequest, request: Request) -> ChatResponse:
    # ── 0. Validate message ───────────────────────────────────────────────────
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message must not be empty.")

    # ── 1. Get or create session ──────────────────────────────────────────────
    sessions = request.app.state.sessions
    llm_client = request.app.state.llm_client

    try:
        session, session_id = sessions.get_or_create(req.session_id, llm_client)
    except Exception as exc:
        logger.error("Session init failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to initialise chat session. Please try again.",
        )

    # ── 2. Run blocking ChatSession.send() off the event loop ─────────────────
    try:
        result: dict = await anyio.to_thread.run_sync(
            lambda: session.send(message),
            cancellable=True,
        )
    except Exception as exc:
        logger.error(
            "Session %s: ChatSession.send() raised %s: %s",
            session_id,
            type(exc).__name__,
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=503,
            detail="The AI assistant encountered an error. Please try again.",
        )

    # ── 3. Extract reply ──────────────────────────────────────────────────────
    reply = (result.get("reply") or "").strip()
    if not reply:
        logger.warning("Session %s: LLM returned an empty reply.", session_id)
        reply = "I'm sorry, I couldn't generate a response. Please try again."

    # ── 4. Parse property cards (skip malformed rows) ─────────────────────────
    properties: list[PropertyResult] = []
    for raw in result.get("properties", []):
        try:
            properties.append(PropertyResult(**raw))
        except Exception as exc:
            logger.warning(
                "Session %s: skipping malformed property dict (%s): %s",
                session_id,
                type(exc).__name__,
                exc,
            )

    # ── 5. Normalise suggestions ──────────────────────────────────────────────
    # chat_engine.py now extracts opt["value"] strings via the options key fix;
    # this layer defends against any unexpected shape (dict, None, …).
    raw_suggestions = result.get("suggestions", [])
    if not isinstance(raw_suggestions, list):
        raw_suggestions = []
    suggestions: list[str] = [str(s) for s in raw_suggestions if s and isinstance(s, str)]

    # ── 6. Server-side diagnostics (never forwarded to client) ────────────────
    if result.get("grounding_warn"):
        logger.warning(
            "Session %s: grounding check flagged a number in the reply that "
            "could not be verified against tool results.",
            session_id,
        )

    usage = result.get("usage", {})
    logger.info(
        "Session %s | turn=%.0f ms | tools=%d | props=%d | suggestions=%d | "
        "prompt_tokens=%s | completion_tokens=%s",
        session_id,
        result.get("turn_ms", 0),
        len(result.get("tool_calls", [])),
        len(properties),
        len(suggestions),
        usage.get("prompt_tokens", "—"),
        usage.get("completion_tokens", "—"),
    )

    # ── 7. Return clean response ──────────────────────────────────────────────
    return ChatResponse(
        reply=reply,
        session_id=session_id,
        properties=properties,
        suggestions=suggestions,
        total_matches=result.get("total_matches"),
        applied_filters=result.get("applied_filters", {}),
    )
