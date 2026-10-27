# Egyptian Real Estate — Machine Learning Project

A machine learning project built on a cleaned Egyptian real estate dataset.
The project covers two independent tracks: **price prediction** using regression
models, and **property recommendation** using a hybrid system combining
content-based filtering with K-Means clustering.

---

## Project Overview

The project ingests raw Egyptian real estate listings, cleans and engineers
features, then trains and evaluates multiple machine learning models across two
objectives:

1. **Price Prediction** — estimate property prices from physical and categorical features.
2. **Property Recommendation** — suggest similar properties to a given listing
   without requiring any user interaction history.

All work is done exclusively on a single dataset of Egyptian real estate listings.
No external datasets are used.

---

## Objectives

- Clean and standardize raw property listings into a consistent, analysis-ready dataset.
- Build and compare multiple regression approaches for price prediction.
- Build a content-based recommender that operates at scale on 62,977 properties.
- Improve recommendation efficiency through K-Means cluster-based candidate filtering.
- Combine both recommendation strategies into a production-ready cascade hybrid system.

---

## Project Structure

```
ADV_ML_02/
├── data/
│   ├── raw/
│   │   └── all_egypt.csv                  # Original raw listings
│   └── processed/
│       ├── cleaned_all_egypt.csv          # Cleaned dataset (62,977 rows, 18 columns)
│       └── clustered_all_egypt.csv        # Cleaned dataset with cluster column added
├── models/
│   ├── regression/                        # Price prediction artifacts
│   ├── recommendation/                    # Content-based filtering artifacts
│   ├── clustering/                        # K-Means artifacts
│   └── hybrid/                            # Hybrid system configuration
├── notebooks/
│   ├── 01_Preprocessing/
│   │   └── 01_cleaning_data_modified.ipynb
│   ├── 02_Price_Regression/
│   │   ├── 01_Price_Regression.ipynb
│   │   ├── 02_Boosting_Regression.ipynb
│   │   └── 03_Stacking_Regression.ipynb
│   └── 03_Recommendation/
│       ├── 01_Content_Based_Filtering.ipynb
│       ├── 02_ML_Clustering.ipynb
│       └── 03_Hybrid_Recommendation_System.ipynb
├── reports/
│   └── figures/
├── src/                                   # Utility modules (stubs)
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
|-------|-----|------|----|
| Polynomial (degree=3) | 0.61 | 0.97 | 0.875 |
| Polynomial (degree=2) | 0.77 | 1.19 | 0.811 |
| Linear / Ridge | 0.83 | 1.29 | 0.776 |
| Dummy (mean) | 2.51 | 2.73 | 0.000 |

**Best:** Polynomial Regression (degree=3) — saved as `best_regression_model.joblib`.

### Notebook 02 — Boosting Models

Compares Decision Tree, AdaBoost, Gradient Boosting, and XGBoost.

| Model | MAE | RMSE | R² |
|-------|-----|------|----|
| Gradient Boosting (n=200, lr=0.2, depth=6) | 0.358 | 0.697 | 0.935 |
| XGBoost (n=300, lr=0.2, depth=5) | 0.362 | 0.696 | 0.935 |
| Decision Tree (max\_depth=4) | 0.592 | 0.929 | 0.884 |
| AdaBoost (n=50, lr=0.01) | 0.634 | 0.977 | 0.872 |

**Best:** Gradient Boosting — saved as `best_boosting_model.joblib`.

### Notebook 03 — Stacking and Voting Ensembles

Combines the best base learners into Voting and Stacking regressors.

| Model | MAE | RMSE | R² |
|-------|-----|------|----|
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

## Technologies Used

| Category | Libraries |
|----------|-----------|
| Data manipulation | `pandas`, `numpy` |
| Machine learning | `scikit-learn`, `xgboost` |
| Similarity search | `scipy.sparse`, `sklearn.metrics.pairwise` |
| Persistence | `joblib` |
| Visualization | `matplotlib`, `seaborn` |
| Environment | Python 3.10, Jupyter Notebook |

---

## Project Workflow

```
Raw Data
  └─► 01_Preprocessing        → cleaned_all_egypt.csv
        ├─► 02_Price_Regression
        │     ├─ 01_Price_Regression     → best_regression_model.joblib
        │     ├─ 02_Boosting_Regression  → best_boosting_model.joblib
        │     └─ 03_Stacking_Regression  → final_price_prediction_model.joblib
        └─► 03_Recommendation
              ├─ 01_Content_Based_Filtering → feature_matrix.npz, top_indices.npy
              ├─ 02_ML_Clustering           → kmeans_model.joblib, clustered_all_egypt.csv
              └─ 03_Hybrid_Recommendation   → hybrid_config.joblib
```

---

## Generated Artifacts

| Path | Description |
|------|-------------|
| `data/processed/cleaned_all_egypt.csv` | Cleaned dataset (62,977 × 18) |
| `data/processed/clustered_all_egypt.csv` | Cleaned dataset + `cluster` column |
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
| `models/clustering/kmeans_model.joblib` | Trained K-Means model (K=19) |
| `models/clustering/scaler.joblib` | Fitted `RobustScaler` for clustering |
| `models/clustering/feature_names.joblib` | Ordered feature list for clustering pipeline |
| `models/hybrid/hybrid_config.joblib` | Hybrid system metadata and artifact paths |

---

## How to Run the Project

Run the notebooks **in order** within each track. Each notebook depends on
artifacts produced by the previous one.

```bash
# 1. Install dependencies
pip install pandas numpy matplotlib seaborn scikit-learn xgboost joblib scipy

# 2. Launch Jupyter
jupyter notebook

# 3. Run in order:
#    notebooks/01_Preprocessing/01_cleaning_data_modified.ipynb
#
#    Price prediction track:
#    notebooks/02_Price_Regression/01_Price_Regression.ipynb
#    notebooks/02_Price_Regression/02_Boosting_Regression.ipynb
#    notebooks/02_Price_Regression/03_Stacking_Regression.ipynb
#
#    Recommendation track:
#    notebooks/03_Recommendation/01_Content_Based_Filtering.ipynb
#    notebooks/03_Recommendation/02_ML_Clustering.ipynb
#    notebooks/03_Recommendation/03_Hybrid_Recommendation_System.ipynb
```

> **Note:** The raw dataset (`data/raw/all_egypt.csv`) must be present before
> running the preprocessing notebook. All subsequent notebooks load from
> `data/processed/`.

---

## Future Work

- **API layer:** Wrap `recommend_hybrid()` and the regression pipeline in a
  REST API for deployment.
- **User feedback loop:** Collect implicit signals (clicks, saves) to extend
  the system with collaborative filtering.
- **Approximate nearest neighbor (ANN):** Replace the pre-indexed cosine search
  with FAISS or Annoy for real-time inference on a growing catalog.
- **Geospatial features:** Incorporate proximity to amenities (schools, metro
  stations) as additional recommendation signals.
- **Automated retraining:** Schedule periodic re-runs of the clustering and CBF
  notebooks as new listings are added.
