"""
app.py — Egyptian Real Estate AI Platform
FastAPI application entry point.

Run from the project root with the project venv:
    .venv\\Scripts\\uvicorn app:app --reload --host 0.0.0.0 --port 8000

Project structure
-----------------
app.py          ← this file  (application factory + lifespan + middleware + health + static SPA)
schemas.py      ← all Pydantic request/response models
core/
    config.py   ← pydantic-settings singleton  (import: from core.config import settings)
    startup.py  ← load_price_model(), build_llm_client()
    sessions.py ← SessionManager (in-memory, TTL eviction, thread-safe)
api/
    chat.py     ← POST /api/chat     (AI Chatbot with function calling)
    predict.py  ← POST /api/predict  (StackingRegressor price prediction)
Front/          ← static SPA served at "/"
"""
from __future__ import annotations

import logging
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ── Ensure the project root is always on sys.path ─────────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Install resilient DNS fallback for Google APIs before any client initializes
import core.dns_fallback

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown logic executed once per application process.

    Startup order:
      1. Load the regression model  → app.state.model
      2. Build the LLM client       → app.state.llm_client
      3. Initialise session manager → app.state.sessions
      4. Store LLM backend name     → app.state.llm_backend  (for /api/health)
    """
    logger.info("=" * 60)
    logger.info("  Egyptian Real Estate AI Platform — STARTING UP")
    logger.info("=" * 60)

    from core.startup import load_price_model, build_llm_client
    from core.sessions import SessionManager

    app.state.model = load_price_model()

    llm_client = build_llm_client()
    app.state.llm_client = llm_client
    app.state.llm_backend = type(llm_client).__name__

    app.state.sessions = SessionManager()

    logger.info("=" * 60)
    logger.info("  Startup complete — application is READY")
    logger.info("  App URL: http://127.0.0.1:8000")
    logger.info("  Docs:    http://127.0.0.1:8000/docs")
    logger.info("  Health:  http://127.0.0.1:8000/api/health")
    logger.info("=" * 60)

    yield

    logger.info(
        "Shutting down — clearing %d active session(s) …",
        app.state.sessions.active_count if hasattr(app.state, "sessions") else 0,
    )
    if hasattr(app.state, "sessions"):
        app.state.sessions.clear()
    logger.info("Shutdown complete.")


# ── Application factory ────────────────────────────────────────────────────
app = FastAPI(
    title="Egyptian Real Estate AI Platform",
    description=(
        "AI-powered property search, price prediction, and conversational "
        "assistant for the Egyptian real estate market."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware — request / response logging ────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Logs every HTTP request with method, path, status code, and elapsed time.

    Example output:
        POST  /api/chat      200   2312 ms
        POST  /api/predict   200     34 ms
        GET   /api/health    200      3 ms
    """
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000

    # Only log API calls and main page loads (avoid spamming asset requests)
    path = request.url.path
    if path.startswith("/api") or path == "/":
        logger.info(
            "%-5s  %-30s  %d   %s",
            request.method,
            path,
            response.status_code,
            f"{elapsed_ms:.0f} ms" if elapsed_ms < 1000 else f"{elapsed_ms / 1000:.2f} s",
        )
    return response


# ── Routers ────────────────────────────────────────────────────────────────
from api.chat import router as chat_router        # noqa: E402
from api.predict import router as predict_router  # noqa: E402
from api.recommendations import router as recommendations_router  # noqa: E402

app.include_router(chat_router)
app.include_router(predict_router)
app.include_router(recommendations_router)


# ── Health check ───────────────────────────────────────────────────────────
@app.get(
    "/api/health",
    tags=["Health"],
    summary="Application health check",
    description=(
        "Returns the operational status of all critical components. "
        "Verify that model_loaded and llm_client_ready are both true after startup."
    ),
)
async def health(request: Request):
    from schemas import HealthResponse

    state = request.app.state
    model_loaded = hasattr(state, "model") and state.model is not None
    llm_ready = hasattr(state, "llm_client") and state.llm_client is not None
    active = state.sessions.active_count if hasattr(state, "sessions") else 0
    backend = getattr(state, "llm_backend", "unknown")

    return HealthResponse(
        status="ok" if (model_loaded and llm_ready) else "degraded",
        model_loaded=model_loaded,
        llm_client_ready=llm_ready,
        active_sessions=active,
        llm_backend=backend,
    )


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


# ── Static SPA frontend ───────────────────────────────────────────────────
# Mount Front/ last so that all /api routes, /docs, and /openapi.json take priority
_front_dir = _PROJECT_ROOT / "Front"
if _front_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(_front_dir), html=True), name="frontend")
