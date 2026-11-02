# Egyptian Real Estate AI Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.1-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Ensemble-EB5424.svg)](https://xgboost.readthedocs.io/)
[![Gemini](https://img.shields.io/badge/Google--GenAI-Gemini%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)

An end-to-end, AI-powered real estate web platform for the Egyptian market. The project combines **machine learning regression ensembles**, **hybrid recommendation engines**, a **bilingual AI conversational assistant**, and an interactive **single-page web application** served through a unified, production-ready FastAPI service.

---

## Table of Contents

1. [Platform Architecture](#platform-architecture)
2. [Key Features](#key-features)
3. [Project Structure](#project-structure)
4. [Dataset & Machine Learning Track](#dataset--machine-learning-track)
   - [Data Cleaning & Feature Engineering](#data-cleaning--feature-engineering)
   - [Price Prediction (Stacking Regressor)](#price-prediction-stacking-regressor)
   - [Hybrid Recommendation System](#hybrid-recommendation-system)
   - [AI Conversational Assistant](#ai-conversational-assistant)
5. [FastAPI Backend Service](#fastapi-backend-service)
   - [Architecture & Design Decisions](#architecture--design-decisions)
   - [API Reference](#api-reference)
6. [Frontend Single-Page Application](#frontend-single-page-application)
7. [Installation & Setup](#installation--setup)
8. [Running the Application](#running-the-application)
9. [Production Deployment Recommendations](#production-deployment-recommendations)
10. [Troubleshooting](#troubleshooting)

---

## Platform Architecture

The platform runs from a single unified FastAPI host on port `8000`, serving both the backend APIs and the frontend Single-Page Application (SPA) without CORS friction:

```text
Browser (Client SPA)
  │
  ├──► GET  /                   ──► Serves Front/index.html & static assets
  ├──► POST /api/chat           ──► Async Chatbot Router (SessionManager + Gemini / Groq)
  ├──► POST /api/predict        ──► Price Prediction Router (StackingRegressor + expm1)
  └──► GET  /api/health         ──► System Health & Operational Status Monitor
```

```text
                                  ┌────────────────────────┐
                                  │   FastAPI Service      │
                                  │       (app.py)         │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
           ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
           │     api/chat.py     │ │   api/predict.py    │ │    core/startup     │
           │  (Non-blocking I/O) │ │  (Offloaded Thread) │ │  (Lifespan Cache)   │
           └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                      │                       │                       │
                      ▼                       ▼                       ▼
           ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
           │   ChatSession       │ │  StackingRegressor  │ │   Singletons:       │
           │  (Gemini / Groq)    │ │ (XGBoost + Sklearn) │ │  - Regression Model │
           │  + 6 Domain Tools   │ │  Target: expm1()    │ │  - LLM Client       │
           └─────────────────────┘ └─────────────────────┘ │  - SessionManager  │
                                                           └─────────────────────┘
```

---

## Key Features

1. **AI Real Estate Chatbot**:
   - Conversational assistant fluent in **Egyptian Arabic** and **English**.
   - Leverages Gemini Function Calling to execute 6 custom domain tools: property search, aggregations, similarity lookups, Arabic location resolution, and dynamic suggestion generation.
   - Preserves multi-turn conversation memory via thread-safe, TTL-bounded sessions.
   - Full grounding checks to prevent numerical hallucinations.

2. **Accurate Price Valuation (ML Regression)**:
   - Evaluates properties based on size, bedrooms, bathrooms, geographical coordinates, property type, and transaction category.
   - Built on a **Stacking Ensemble** combining Ridge, Lasso, ElasticNet, Gradient Boosting, and XGBoost with a Linear Regression meta-learner ($R^2 = 0.930$).
   - Returns point estimates and realistic $\pm8\%$ market confidence intervals rounded to market-standard steps.

3. **Hybrid Recommendation Engine**:
   - Cascade Hybrid combining a 19-cluster **K-Means segmentation** with **Content-Based Cosine Similarity** across 191 engineered features.
   - Pre-indexed neighbor lookups delivering sub-millisecond retrieval across 62,977 listings.

4. **Production-Ready Web Service**:
   - Fully modularized FastAPI architecture with centralized Pydantic settings.
   - Automatic HTTP request latency logging middleware.
   - Comprehensive error handling and input validation (Pydantic models).
   - Zero-configuration static hosting serving the complete responsive UI.

---

## Project Structure

```text
ADV_ML_02/
├── app.py                              # FastAPI entry point, lifespan, middleware & static hosting
├── schemas.py                          # Pydantic request/response data contracts
├── requirements.txt                    # Project dependencies
├── .env.example                        # Template for API keys & configuration
│
├── core/                               # Core application foundation
│   ├── __init__.py
│   ├── config.py                       # Centralized pydantic-settings configuration
│   ├── startup.py                      # Model preloading & LLM client factory
│   └── sessions.py                     # Thread-safe in-memory session manager (30m TTL)
│
├── api/                                # REST API routers
│   ├── __init__.py
│   ├── chat.py                         # POST /api/chat endpoint
│   └── predict.py                      # POST /api/predict endpoint
│
├── Front/                              # Single-Page Application (SPA)
│   ├── index.html                      # Bilingual HTML layout
│   ├── style.css                       # Responsive design & animations
│   ├── script.js                       # Real API integration (chat, predict, UI)
│   └── assets/                         # Images, icons, and client data
│
├── models/                             # Trained model artifacts
│   ├── regression/
│   │   ├── final_price_prediction_model.joblib   # Production StackingRegressor
│   │   ├── best_regression_model.joblib
│   │   └── best_boosting_model.joblib
│   ├── recommendation/                 # CBF similarity indices and encoders
│   └── clustering/                     # K-Means model (K=19) and scalers
│
├── src/                                # Machine learning & chatbot source code
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── evaluation.py
│   ├── utils.py
│   └── chatbot/                        # Chatbot engine package
│       ├── chat_engine.py              # ChatSession & GeminiClient
│       ├── openai_client.py            # OpenAICompatibleClient (Groq / OpenRouter)
│       ├── tools.py                    # 6 functional tool implementations
│       └── prompts.py                  # Bilingual system prompts
│
├── notebooks/                          # Development & experimentation notebooks
│   ├── 01_Preprocessing/
│   ├── 02_Price_Regression/
│   ├── 03_Recommendation/
│   └── 04_Chat_bot/
│
└── data/                               # Datasets (raw & processed)
    ├── raw/all_egypt.csv
    └── processed/
```

---

## Dataset & Machine Learning Track

### Data Cleaning & Feature Engineering
- Processed **62,977 listings** sourced from [Kaggle](https://www.kaggle.com/datasets/mohammedhassan1112/egypt-property-finder) across 4 primary categories: `buy`, `rent`, `commercial_buy`, and `commercial_rent`.
- Cleaned skewed distributions, unified price currencies, parsed geographic locations into canonical Egyptian governorates/cities/districts, and engineered coordinate features.

### Price Prediction (Stacking Regressor)
- **Target Variable**: Trained on $\log(1 + \text{price})$ to address exponential price distributions.
- **Inference Pipeline**: Output is mapped back via $\text{expm1}(y)$ to compute real-world EGP values.
- **Features Used**: `size`, `bedrooms`, `bathrooms`, `latitude`, `longitude`, `property_type`, `category`.
- **Performance**:
  - $R^2 = 0.930$, $\text{RMSE} = 0.724$ on the held-out test split.

### Hybrid Recommendation System
- **Stage 1 (Retrieval)**: Uses K-Means ($K=19$) to segment properties, pruning the candidate pool by $\sim95\%$.
- **Stage 2 (Ranking)**: Precomputed cosine similarity across 191-dimensional feature vectors (amenities, location, price, dimensions) ensures sub-millisecond retrieval.

### AI Conversational Assistant
- **Dual Backend Support**: Operates out-of-the-box with Google Gemini (`gemini-3.5-flash-lite`, `gemini-2.0-flash`) or OpenAI-compatible gateways (Groq / OpenRouter).
- **Tool Calling Architecture**: Integrates 6 internal functions with automatic thought signature retention to support newer reasoning models.

---

## FastAPI Backend Service

### Architecture & Design Decisions

1. **Singleton Preloading**:
   - The Stacking Regressor and LLM Client are initialized **once** during FastAPI application startup (`lifespan`). Request handlers reuse cached instances from `app.state`, eliminating per-request loading overhead.
2. **Asynchronous Non-Blocking Execution**:
   - Synchronous, CPU-bound ML predictions and blocking LLM network calls are dispatched via `anyio.to_thread.run_sync()`. This ensures the main asyncio event loop remains responsive.
3. **Thread-Safe Session Manager**:
   - Handles multi-turn conversational history with in-memory mutex protection (`threading.Lock`) and automatic lazy eviction of inactive sessions (default TTL: 30 minutes).
4. **Request Logging Middleware**:
   - Intercepts all incoming requests, logging HTTP method, path, status code, and latency formatted in milliseconds or seconds.

### API Reference

#### 1. `POST /api/chat`
Send a message to the AI real estate assistant.

- **Request Body**:
  ```json
  {
    "message": "I want to rent a 2-bedroom apartment in Maadi",
    "session_id": "optional-uuid-string"
  }
  ```
- **Response Body**:
  ```json
  {
    "reply": "I found 2 apartments for rent in Maadi with 2 bedrooms...",
    "session_id": "c4557537-0872-461e-9b0e-86ea3b70ae4c",
    "properties": [
      {
        "id": 7105183,
        "title": "Furnished apartment for rent in Maadi",
        "price": 28000.0,
        "price_label": "EGP / month",
        "property_type": "Apartment",
        "category": "rent",
        "location": "Maadi, Hay El Maadi, Cairo",
        "bedrooms": 2.0,
        "bathrooms": 1.0,
        "size": 140.0,
        "image_url": "https://...",
        "share_url": "https://..."
      }
    ],
    "suggestions": ["Cairo", "Degla", "Sarayat El Maadi"]
  }
  ```

#### 2. `POST /api/predict`
Calculate a market valuation estimate for a property.

- **Request Body**:
  ```json
  {
    "category": "buy",
    "property_type": "Apartment",
    "size": 150.0,
    "bedrooms": 3.0,
    "bathrooms": 2.0,
    "latitude": 30.022596,
    "longitude": 31.470938
  }
  ```
- **Response Body**:
  ```json
  {
    "predicted_price": 9225000.0,
    "range_low": 8475000.0,
    "range_high": 9975000.0,
    "currency": "EGP"
  }
  ```

#### 3. `GET /api/health`
Health check verifying internal subsystems.

- **Response Body**:
  ```json
  {
    "status": "ok",
    "model_loaded": true,
    "llm_client_ready": true,
    "active_sessions": 1,
    "llm_backend": "GeminiClient"
  }
  ```

---

## Frontend Single-Page Application

The frontend is an interactive, bilingual (Arabic RTL / English LTR) web application located under `Front/`:
- **Zero Framework Bloat**: Built with vanilla HTML5, CSS3, and JavaScript for maximum performance and instant load times.
- **Real-Time AI Integration**:
  - Chat interface connects to `/api/chat` with dynamic typing indicators, card rendering, and prompt suggestions.
  - Interactive price valuation form connects to `/api/predict` with loading states and smooth entry animations.
  - Session state persists across refreshes using browser `sessionStorage`.

---

## Installation & Setup

### Prerequisites
- Python 3.11, 3.12, or 3.13
- Git

### 1. Clone & Set Up Virtual Environment

```bash
# Clone the repository
git clone <repo-url>
cd ADV_ML_02

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (cmd):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env     # Linux / macOS
copy .env.example .env   # Windows
```

Edit `.env` with your API credentials:

```ini
# Gemini API Key (recommended)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Groq / OpenRouter fallback (optional)
LLM_PROVIDER=groq
LLM_MODEL=openai/gpt-oss-120b
GROQ_API_KEY=your_groq_api_key_here
```

---

## Running the Application

### Development Server

Start the application with Uvicorn:

```bash
# Windows:
.venv\Scripts\uvicorn app:app --reload --host 127.0.0.1 --port 8000

# Linux / macOS:
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### Accessing the Platform

- **Web Application**: Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in any browser.
- **Interactive Swagger Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- **Health Check**: Open [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health).

---

## Production Deployment Recommendations

For production environments (Linux / Cloud VM / Container), the following architecture is recommended:

### 1. Process Management with Gunicorn & Uvicorn Workers

Run Uvicorn workers managed by Gunicorn for high concurrency and auto-restart on worker crash:

```bash
pip install gunicorn

gunicorn app:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

> **Note on Session Scaling**: When running multiple worker processes, consider migrating the in-memory `SessionManager` in `core/sessions.py` to a shared Redis store so chat session state is accessible across all workers.

### 2. Reverse Proxy with Nginx

Place Nginx in front of the application for SSL termination (HTTPS), gzip compression, and rate limiting:

```nginx
server {
    listen 80;
    server_name realestate.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Containerization (Docker)

Recommended multi-stage `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| `ModuleNotFoundError: No module named 'xgboost'` | The model requires XGBoost inside scikit-learn. | Ensure the active environment is the project `.venv` (`.venv\Scripts\python.exe`), not global Python. |
| `400 INVALID_ARGUMENT: thought_signature` | Gemini 3.x+ requires thought signatures across multi-turn tool calling. | Handled automatically in `src/chatbot/chat_engine.py` by preserving `p.thought_signature`. |
| `503 Service Unavailable: Model not loaded` | The `.joblib` model file is missing or corrupted. | Verify that `models/regression/final_price_prediction_model.joblib` exists on disk. |
| Chat replies take 10–15 seconds | Complex multi-turn property queries execute multiple tool rounds. | This is expected when the model calls `resolve_location` followed by `search_properties`. Token usage is logged in stdout. |
| Browser CORS errors | Accessing the API from a different origin or port. | CORS is enabled for all origins in `app.py`. Alternatively, access the frontend through `http://127.0.0.1:8000/`. |

---

## Authors & Acknowledgments

- **Project**: Egyptian Real Estate AI Platform (Machine Learning Graduation Project).
- **Dataset**: Real-world property listings sourced from [Kaggle](https://www.kaggle.com/datasets/mohammedhassan1112/egypt-property-finder).
- **Technologies**: Scikit-learn, XGBoost, Google Gemini, FastAPI, Uvicorn.
