# Egyptian Real Estate — Machine Learning Project

A machine learning project built on a cleaned Egyptian real estate dataset.
The project covers three independent tracks: **price prediction** using regression
models, **property recommendation** using a hybrid system combining content-based
filtering with K-Means clustering, and an **AI-powered chatbot** that lets users
explore and query the property database through natural language.

---

## Project Overview

The project ingests raw Egyptian real estate listings, cleans and engineers
features, then trains and evaluates multiple machine learning models across two
objectives — and exposes them through a conversational interface:

1. **Price Prediction** — estimate property prices from physical and categorical features.
2. **Property Recommendation** — suggest similar properties to a given listing
   without requiring any user interaction history.
3. **AI Chatbot** — a Gemini / Groq-powered assistant that queries the live
   property database via function-calling tools, resolves Arabic location names,
   and guides users to the most relevant listings.

All work is done exclusively on a single dataset of Egyptian real estate listings.
No external datasets are used.

---

## Objectives

- Clean and standardize raw property listings into a consistent, analysis-ready dataset.
- Build and compare multiple regression approaches for price prediction.
- Build a content-based recommender that operates at scale on 62,977 properties.
- Improve recommendation efficiency through K-Means cluster-based candidate filtering.
- Combine both recommendation strategies into a production-ready cascade hybrid system.
- Expose the recommendation and search capabilities through a bilingual (Arabic/English)
  conversational chatbot backed by Gemini or any OpenAI-compatible LLM (e.g. Groq).

---

## Project Structure

```
ADV_ML_02/
├── data/
│   ├── raw/
│   │   └── all_egypt.csv                      # Original raw listings
│   └── processed/
│       ├── cleaned_all_egypt.csv              # Cleaned dataset (62,977 rows, 18 columns)
│       ├── clustered_all_egypt.csv            # Cleaned dataset with cluster column added
│       └── chat_bot/                          # Chatbot-specific data assets
│           ├── chatbot_properties_v2.parquet  # Optimised property table for the chatbot
│           ├── amenities_mapping_v2.json      # Verified amenity code → name mapping
│           ├── location_lookup.csv            # Canonical location resolution table
│           ├── conversations_demo.json        # Sample recorded conversations
│           ├── engine_metrics.csv             # Per-turn metrics (Gemini backend)
│           ├── engine_metrics_groq.csv        # Per-turn metrics (Groq backend)
│           └── tools_test_results.csv         # Tool-level unit test results
├── models/
│   ├── regression/                            # Price prediction artifacts
│   ├── recommendation/                        # Content-based filtering artifacts
│   ├── clustering/                            # K-Means artifacts
│   └── hybrid/                               # Hybrid system configuration
├── notebooks/
│   ├── 01_Preprocessing/
│   │   └── 01_cleaning_data_modified.ipynb
│   ├── 02_Price_Regression/
│   │   ├── 01_Price_Regression.ipynb
│   │   ├── 02_Boosting_Regression.ipynb
│   │   └── 03_Stacking_Regression.ipynb
│   ├── 03_Recommendation/
│   │   ├── 01_Content_Based_Filtering.ipynb
│   │   ├── 02_ML_Clustering.ipynb
│   │   └── 03_Hybrid_Recommendation_System.ipynb
│   └── 04_Chat_bot/
│       ├── 01_Chatbot_Data_Preparation.ipynb  # Build parquet, amenity map, location lookup
│       ├── 02_Chatbot_Tools.ipynb             # Develop & unit-test all tool functions
│       ├── 03_Gemini_Function_Calling.ipynb   # End-to-end chatbot with Gemini backend
│       └── 04_LLMClient_Groq.ipynb            # End-to-end chatbot with Groq/OpenRouter
├── reports/
│   ├── figures/
│   ├── results/
│   └── recommendation_dataset_summary.md
├── src/
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── evaluation.py
│   ├── utils.py
│   └── chatbot/                              # Production-ready chatbot package
│       ├── __init__.py
│       ├── tools.py                          # Six tool functions + TOOL_DECLARATIONS
│       ├── chat_engine.py                    # ChatSession, GeminiClient, FakeLLMClient
│       ├── openai_client.py                  # OpenAICompatibleClient (Groq / OpenRouter)
│       └── prompts.py                        # SYSTEM_PROMPT + user_profile_section()
├── .env.example                              # API key template (copy → .env)
├── requirements.txt
└── README.md
```

---

## Dataset

| Attribute | Value |
|-----------|-------|
| Source | Egyptian real estate listings (raw: `all_egypt.csv`) |
| Cleaned rows | 62,977 properties |
| Columns | 18 (id, title, price, currency, property\_type, location, latitude, longitude, bedrooms, bathrooms, size, amenities, category, and others) |
| Property categories | `buy` (19,965) · `rent` (19,979) · `commercial_buy` (8,953) · `commercial_rent` (14,080) |
| Top property types | Apartment (25,086) · Office Space (14,283) · Villa (5,583) · Shop (3,453) · Chalet (2,192) |
| Price (median) | 485,000 EGP |
| Size (median) | 167 m² |
| Bedrooms range | 1 – 7 |

---

## Data Preprocessing

**Notebook:** `01_Preprocessing/01_cleaning_data_modified.ipynb`

- Removed unnecessary identifier and metadata columns.
- Dropped records with missing values in essential features (price, size, location, property type, category).
- Preserved intentionally missing values in `bedrooms` and `bathrooms` (imputed later per model).
- Standardized column types and verified the final dataset shape.
- Saved the cleaned dataset to `data/processed/cleaned_all_egypt.csv`.

---

## Price Prediction

Three notebooks progressively build and compare regression approaches.
All models use a `ColumnTransformer` preprocessing pipeline with `RobustScaler`
for numerical features and `OneHotEncoder` for categorical ones.
Metrics are computed on a held-out test set. Prices are log-transformed before
training to handle skewness.

### Notebook 01 — Linear Models

Compares Linear, Polynomial (degrees 2 and 3), Ridge, Lasso, ElasticNet, and a
Dummy baseline.

| Model | MAE | RMSE | R² |
|-------|-----|------|-----|
| Polynomial (degree=3) | 0.61 | 0.97 | 0.875 |
| Polynomial (degree=2) | 0.77 | 1.19 | 0.811 |
| Linear / Ridge | 0.83 | 1.29 | 0.776 |
| Dummy (mean) | 2.51 | 2.73 | 0.000 |

**Best:** Polynomial Regression (degree=3) — saved as `best_regression_model.joblib`.

### Notebook 02 — Boosting Models

Compares Decision Tree, AdaBoost, Gradient Boosting, and XGBoost.

| Model | MAE | RMSE | R² |
|-------|-----|------|-----|
| Gradient Boosting (n=200, lr=0.2, depth=6) | 0.358 | 0.697 | 0.935 |
| XGBoost (n=300, lr=0.2, depth=5) | 0.362 | 0.696 | 0.935 |
| Decision Tree (max\_depth=4) | 0.592 | 0.929 | 0.884 |
| AdaBoost (n=50, lr=0.01) | 0.634 | 0.977 | 0.872 |

**Best:** Gradient Boosting — saved as `best_boosting_model.joblib`.

### Notebook 03 — Stacking and Voting Ensembles

Combines the best base learners into Voting and Stacking regressors.

| Model | MAE | RMSE | R² |
|-------|-----|------|-----|
| Stacking Regressor | 0.401 | 0.724 | 0.930 |
| Voting Regressor | 0.609 | 0.983 | 0.871 |

**Final model:** Stacking Regressor — saved as `final_price_prediction_model.joblib`.

---

## Recommendation System

Three notebooks implement an end-to-end item-based recommendation pipeline.
No user interaction data is required.

### Notebook 01 — Content-Based Filtering

Builds a property similarity model using a 191-dimensional feature matrix
(log-price, log-size, bedrooms, bathrooms, coordinates, amenities via
MultiLabelBinarizer, property type, and category). Cosine similarity is
computed between all property pairs. The top-50 neighbors for every property
are pre-indexed and saved to disk to enable sub-millisecond query-time lookups.

### Notebook 02 — K-Means Clustering Pipeline

Trains a K-Means model (K=19, selected via Elbow + Silhouette search over
K=4–20) to segment properties into market-coherent clusters. Features used:
`log_price`, `log_size`, `bedrooms`, `bathrooms`, `bed_bath_ratio`, plus
OneHotEncoded `category` and `property_type` (41 total features, scaled with
`RobustScaler`). Each property is assigned a cluster label and the result is
saved to `clustered_all_egypt.csv`.

### Notebook 03 — Hybrid Recommendation System

Implements a **Cascade Hybrid** that chains the two models:

1. **Stage 1 (Retrieval):** Look up the query property's cluster using the
   precomputed K-Means assignment — reduces the search space from 62,977 to
   ~3,300 properties (~19× reduction).
2. **Stage 2 (Ranking):** Run Content-Based cosine similarity only within that
   cluster, using the precomputed top-50 neighbor index.
3. **Output:** Return the Top-N most similar in-cluster properties with rank,
   similarity score, price, property type, category, bedrooms, bathrooms, size,
   and location.

The hybrid guarantees that recommendations stay within the same market segment
(e.g., rental apartments do not surface commercial buy listings) while
maintaining the precision of feature-level similarity ranking.

---

## AI Chatbot

The chatbot is a bilingual (Arabic / English) conversational assistant that lets
users search, filter, and explore the property database through natural language.
It is implemented as a reusable Python package under `src/chatbot/` and developed
across four notebooks.

### Architecture

```
ChatSession
  ├── LLMClient (abstract)
  │     ├── GeminiClient          ← google-genai ≥ 1.0, function-calling mode
  │     └── OpenAICompatibleClient ← httpx-based, works with Groq / OpenRouter
  └── Tool loop  ──► src/chatbot/tools.py
                        ├── search_properties     # filter + sort listings
                        ├── get_breakdown         # aggregate stats by dimension
                        ├── get_similar           # cosine-similarity neighbours
                        ├── suggest_next_question # rule-based slot advisor
                        ├── relax_filters         # progressive filter relaxation
                        └── resolve_location      # Arabic → canonical location
```

### Chatbot Notebooks

| Notebook | Purpose |
|----------|---------|
| `04_Chat_bot/01_Chatbot_Data_Preparation.ipynb` | Build `chatbot_properties_v2.parquet`, `amenities_mapping_v2.json`, and `location_lookup.csv` from the cleaned dataset |
| `04_Chat_bot/02_Chatbot_Tools.ipynb` | Develop and unit-test all six tool functions against the live data |
| `04_Chat_bot/03_Gemini_Function_Calling.ipynb` | End-to-end chatbot using `GeminiClient`; logs metrics to `engine_metrics.csv` |
| `04_Chat_bot/04_LLMClient_Groq.ipynb` | Same chatbot via `OpenAICompatibleClient` (Groq / OpenRouter); logs to `engine_metrics_groq.csv` |

### Key Design Decisions

- **Backend-agnostic `ChatSession`** — swapping Gemini for Groq (or any OpenAI-compatible
  endpoint) requires only passing a different `LLMClient` instance.
- **Dynamic tool selection** — on first turns, only `search_properties` and
  `resolve_location` are sent to the model (~83% token reduction). Extended tools
  (`get_breakdown`, `get_similar`, `suggest_next_question`) are added after the
  first tool-call round. `relax_filters` replaces them when the last search
  returned zero results.
- **Schema compaction** — tool descriptions and redundant filter-property metadata
  are stripped before every API call to stay within token-per-minute limits.
- **Exponential-backoff retry** — both clients retry transient errors (429, 503,
  timeout) up to 3 times; `OpenAICompatibleClient` also honours `Retry-After` headers.
- **Grounding check** — `ChatSession` warns if the model's reply contains numbers
  that are not present in any tool result from the current turn.
- **`FakeLLMClient`** — scripted backend for deterministic unit tests without
  real API calls.
- **Bilingual system prompt** — Gemini mirrors the user's language (Egyptian Arabic
  or English) at runtime; raw amenity codes are never exposed to the user.

---

## Technologies Used

| Category | Libraries |
|----------|-----------|
| Data manipulation | `pandas`, `numpy`, `pyarrow` |
| Machine learning | `scikit-learn`, `xgboost` |
| Similarity search | `scipy.sparse`, `sklearn.metrics.pairwise` |
| Persistence | `joblib` |
| Visualization | `matplotlib`, `seaborn` |
| LLM — Gemini | `google-genai >= 1.0` |
| LLM — OpenAI-compatible | `httpx >= 0.24` (openai SDK optional) |
| Configuration | `python-dotenv >= 1.0` |
| Environment | Python 3.13, Jupyter Notebook / JupyterLab |

---

## Project Workflow

```
Raw Data
  └─► 01_Preprocessing            → cleaned_all_egypt.csv
        ├─► 02_Price_Regression
        │     ├─ 01_Price_Regression      → best_regression_model.joblib
        │     ├─ 02_Boosting_Regression   → best_boosting_model.joblib
        │     └─ 03_Stacking_Regression   → final_price_prediction_model.joblib
        ├─► 03_Recommendation
        │     ├─ 01_Content_Based_Filtering → feature_matrix.npz, top_indices.npy
        │     ├─ 02_ML_Clustering           → kmeans_model.joblib, clustered_all_egypt.csv
        │     └─ 03_Hybrid_Recommendation   → hybrid_config.joblib
        └─► 04_Chat_bot
              ├─ 01_Chatbot_Data_Preparation → chatbot_properties_v2.parquet,
              │                                amenities_mapping_v2.json,
              │                                location_lookup.csv
              ├─ 02_Chatbot_Tools            → tools_test_results.csv
              ├─ 03_Gemini_Function_Calling  → engine_metrics.csv,
              │                                conversations_demo.json
              └─ 04_LLMClient_Groq           → engine_metrics_groq.csv
```

---

## Generated Artifacts

| Path | Description |
|------|-------------|
| `data/processed/cleaned_all_egypt.csv` | Cleaned dataset (62,977 × 18) |
| `data/processed/clustered_all_egypt.csv` | Cleaned dataset + `cluster` column |
| `data/processed/chat_bot/chatbot_properties_v2.parquet` | Chatbot-optimised property table (categorical dtypes, images, share\_url) |
| `data/processed/chat_bot/amenities_mapping_v2.json` | Verified amenity code → name mapping (v2 format with `verified` flag) |
| `data/processed/chat_bot/location_lookup.csv` | Canonical governorate / city / district / area lookup for `resolve_location` |
| `data/processed/chat_bot/conversations_demo.json` | Recorded demo conversations |
| `data/processed/chat_bot/engine_metrics.csv` | Per-turn token + latency metrics (Gemini) |
| `data/processed/chat_bot/engine_metrics_groq.csv` | Per-turn token + latency metrics (Groq) |
| `data/processed/chat_bot/tools_test_results.csv` | Tool unit-test results |
| `models/regression/best_regression_model.joblib` | Best linear model (Polynomial degree=3) |
| `models/regression/best_boosting_model.joblib` | Best boosting model (Gradient Boosting) |
| `models/regression/final_price_prediction_model.joblib` | Final ensemble (Stacking Regressor) |
| `models/regression/regression_results.csv` | Linear model comparison metrics |
| `models/regression/boosting_results.csv` | Boosting model comparison metrics |
| `models/regression/stacking_results.csv` | Ensemble model comparison metrics |
| `models/recommendation/feature_matrix.npz` | Sparse CBF feature matrix (62,977 × 191) |
| `models/recommendation/top_indices.npy` | Pre-indexed top-50 neighbors per property |
| `models/recommendation/top_scores.npy` | Corresponding cosine similarity scores |
| `models/recommendation/preprocessor.joblib` | Fitted `ColumnTransformer` for CBF |
| `models/recommendation/id_to_idx.joblib` | Property ID → matrix row index map |
| `models/recommendation/idx_to_id.joblib` | Matrix row index → property ID map (reverse) |
| `models/recommendation/mlb.joblib` | Fitted `MultiLabelBinarizer` for amenities |
| `models/recommendation/amenity_labels.joblib` | Amenity label array |
| `models/recommendation/feature_names.joblib` | Ordered feature names for CBF pipeline |
| `models/clustering/kmeans_model.joblib` | Trained K-Means model (K=19) |
| `models/clustering/scaler.joblib` | Fitted `RobustScaler` for clustering |
| `models/clustering/feature_names.joblib` | Ordered feature list for clustering pipeline |
| `models/clustering/label_encoders.joblib` | Fitted label encoders for clustering |
| `models/clustering/pca.joblib` | Fitted PCA (if used) |
| `models/clustering/id_cluster_map.joblib` | Property ID → cluster label map |
| `models/hybrid/hybrid_config.joblib` | Hybrid system metadata and artifact paths |
| `models/hybrid/id_cluster_map.joblib` | Property ID → cluster map (hybrid copy) |

---

## How to Run the Project

### 1. Environment Setup

```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install all dependencies
pip install -r requirements.txt
```

### 2. API Keys (chatbot only)

Copy `.env.example` to `.env` and fill in your keys:

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit `.env`:

```ini
# Gemini (notebook 03)
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# Groq / OpenRouter (notebook 04)
LLM_PROVIDER=groq          # or "openrouter"
LLM_MODEL=openai/gpt-oss-120b
GROQ_API_KEY=your_groq_key_here
# OPENROUTER_API_KEY=your_openrouter_key_here
```

### 3. Launch Jupyter

```bash
jupyter notebook
# or: jupyter lab
```

### 4. Run Notebooks in Order

```
# Preprocessing (required first):
notebooks/01_Preprocessing/01_cleaning_data_modified.ipynb

# Price prediction track:
notebooks/02_Price_Regression/01_Price_Regression.ipynb
notebooks/02_Price_Regression/02_Boosting_Regression.ipynb
notebooks/02_Price_Regression/03_Stacking_Regression.ipynb

# Recommendation track:
notebooks/03_Recommendation/01_Content_Based_Filtering.ipynb
notebooks/03_Recommendation/02_ML_Clustering.ipynb
notebooks/03_Recommendation/03_Hybrid_Recommendation_System.ipynb

# Chatbot track (requires recommendation artifacts above):
notebooks/04_Chat_bot/01_Chatbot_Data_Preparation.ipynb
notebooks/04_Chat_bot/02_Chatbot_Tools.ipynb
notebooks/04_Chat_bot/03_Gemini_Function_Calling.ipynb   # needs GEMINI_API_KEY
notebooks/04_Chat_bot/04_LLMClient_Groq.ipynb            # needs GROQ_API_KEY
```

> **Note:** The raw dataset (`data/raw/all_egypt.csv`) must be present before
> running the preprocessing notebook. All subsequent notebooks load from
> `data/processed/`.

---

## Using the Chatbot Package Programmatically

```python
from src.chatbot.chat_engine import ChatSession, GeminiClient, load_env

# Using Gemini (reads GEMINI_API_KEY + GEMINI_MODEL from .env)
api_key, model_name = load_env()
session = ChatSession(llm_client=GeminiClient(api_key, model_name))
result = session.send("Show me 3-bedroom apartments for sale in New Cairo")
print(result["reply"])

# Using Groq / OpenRouter
from src.chatbot.openai_client import OpenAICompatibleClient, load_env_openai

api_key, model_name, provider, base_url = load_env_openai()
client = OpenAICompatibleClient(api_key, model_name, base_url, provider)
session = ChatSession(llm_client=client)
result = session.send("عايز شقة للإيجار في القاهرة")
print(result["reply"])
```

---

## Future Work

- **API layer:** Wrap `ChatSession`, `recommend_hybrid()`, and the regression
  pipeline in a FastAPI service for production deployment.
- **User feedback loop:** Collect implicit signals (clicks, saves) to extend
  the system with collaborative filtering.
- **Approximate nearest neighbor (ANN):** Replace the pre-indexed cosine search
  with FAISS or Annoy for real-time inference on a growing catalog.
- **Geospatial features:** Incorporate proximity to amenities (schools, metro
  stations) as additional recommendation signals.
- **Automated retraining:** Schedule periodic re-runs of the clustering and CBF
  notebooks as new listings are added.
- **Streaming responses:** Add streaming support to `ChatSession` for a more
  responsive chat UI experience.
