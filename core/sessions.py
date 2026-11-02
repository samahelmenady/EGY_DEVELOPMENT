"""
core/sessions.py — In-memory chat session manager.

Design
------
SessionManager keeps one ChatSession per browser tab, keyed by a UUID.
Sessions that have been idle for more than SESSION_TTL seconds are evicted
lazily on each get_or_create call so memory stays bounded without a
background thread.

Thread safety
-------------
FastAPI's async event loop runs in a single thread, but ChatSession.send()
is offloaded to a thread pool (in api/chat.py) via anyio.to_thread.run_sync.
Multiple threads may therefore read/write _sessions concurrently, so a
threading.Lock protects every dict access.

Scaling note
------------
This implementation is correct for a single-process server (one uvicorn worker).
For multi-worker or multi-machine deployments, replace the in-memory dict with
a Redis-backed store and serialise ChatSession history externally.
"""
from __future__ import annotations

import logging
import threading
import time
import uuid
from typing import Optional

from core.config import settings
from src.chatbot.chat_engine import ChatSession, LLMClient

logger = logging.getLogger(__name__)


class SessionManager:
    """
    Thread-safe in-memory store of active ChatSession objects.

    Usage (inside a FastAPI route handler)
    ---------------------------------------
        session, session_id = request.app.state.sessions.get_or_create(
            req.session_id,
            llm_client=request.app.state.llm_client,
        )
    """

    def __init__(self, ttl: int | None = None) -> None:
        # _sessions maps session_id -> (ChatSession, last_access_monotonic_time)
        self._sessions: dict[str, tuple[ChatSession, float]] = {}
        self._ttl: int = ttl if ttl is not None else settings.session_ttl_seconds
        self._lock: threading.Lock = threading.Lock()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_or_create(
        self,
        session_id: Optional[str],
        llm_client: LLMClient,
    ) -> tuple[ChatSession, str]:
        """
        Return an existing (non-stale) session or create a new one.

        Parameters
        ----------
        session_id : str | None
            The session UUID sent by the client. Pass None (or omit) to
            always create a new session.
        llm_client : LLMClient
            The shared LLM client from app.state. Passed to new sessions only.

        Returns
        -------
        (ChatSession, session_id) : tuple
            The session_id in the returned tuple is guaranteed to be valid.
            It may differ from the input when a new session is created.
        """
        with self._lock:
            self._evict_stale()

            if session_id and session_id in self._sessions:
                session, _ = self._sessions[session_id]
                # Refresh last-access timestamp
                self._sessions[session_id] = (session, time.monotonic())
                logger.debug("Resumed session %s (history_len=%d)", session_id, len(session._history))
                return session, session_id

            # Create a new session
            new_id = str(uuid.uuid4())
            session = ChatSession(session_id=new_id, llm_client=llm_client)
            self._sessions[new_id] = (session, time.monotonic())
            logger.info("Created session %s (total_active=%d)", new_id, len(self._sessions))
            return session, new_id

    def reset_session(self, session_id: str) -> bool:
        """
        Clear a session's history without deleting the session entry.
        Returns True if the session existed, False otherwise.
        """
        with self._lock:
            if session_id in self._sessions:
                session, ts = self._sessions[session_id]
                session.reset()
                self._sessions[session_id] = (session, time.monotonic())
                logger.info("Reset session %s", session_id)
                return True
            return False

    @property
    def active_count(self) -> int:
        """Number of live (non-evicted) sessions currently in memory."""
        with self._lock:
            return len(self._sessions)

    def clear(self) -> None:
        """Remove all sessions. Called at application shutdown."""
        with self._lock:
            count = len(self._sessions)
            self._sessions.clear()
            logger.info("SessionManager cleared %d session(s).", count)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _evict_stale(self) -> None:
        """
        Remove sessions idle for longer than self._ttl seconds.
        Must be called while self._lock is held.
        """
        now = time.monotonic()
        stale_ids = [
            sid
            for sid, (_, last_access) in self._sessions.items()
            if now - last_access > self._ttl
        ]
        for sid in stale_ids:
            del self._sessions[sid]
            logger.info("Evicted idle session %s (TTL=%ds)", sid, self._ttl)

