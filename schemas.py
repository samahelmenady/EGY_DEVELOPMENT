"""
schemas.py — Pydantic request/response models for the Egyptian Real Estate AI Platform.

All API contracts live here so that api/chat.py, api/predict.py, and tests share
a single source of truth for data shapes. Changing a field means changing it once.
"""
from __future__ import annotations

from typing import List, Optional, Union

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared sub-model
# ---------------------------------------------------------------------------

class PropertyResult(BaseModel):
    """
    One property listing returned by the chatbot's search_properties tool.
    Field names match _row_to_compact() in src/chatbot/tools.py exactly.
    """
    id: int
    title: str
    price: Optional[float] = None
    price_label: str                   # "EGP" (buy) or "EGP / month" (rent)
    property_type: str
    category: str                      # "buy" | "rent" | "commercial_buy" | "commercial_rent"
    location: str
    bedrooms: Optional[float] = None   # null for commercial types that have none
    bathrooms: Optional[float] = None
    size: Optional[float] = None       # m²
    image_url: Optional[str] = None
    share_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's message or question.",
    )
    session_id: Optional[str] = Field(
        None,
        description=(
            "Existing session UUID. Omit (or pass null) on the first message "
            "of a new conversation; the server will create a session and return "
            "the new session_id in the response."
        ),
    )


class ChatResponse(BaseModel):
    reply: str = Field(description="The assistant's text reply.")
    session_id: str = Field(description="Session UUID — persist this in sessionStorage.")
    properties: List[PropertyResult] = Field(
        default_factory=list,
        description="Property cards to render (from the last search_properties tool call).",
    )
    suggestions: List[str] = Field(
        default_factory=list,
        description="Next-question suggestions for the prompt buttons.",
    )
    total_matches: Optional[int] = Field(
        None,
        description="Total matching properties count in catalog.",
    )
    applied_filters: Optional[dict] = Field(
        default_factory=dict,
        description="Filters applied in the search.",
    )


# ---------------------------------------------------------------------------
# Price prediction
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    """
    Maps directly to the 7 feature columns of final_price_prediction_model.joblib
    (a StackingRegressor with feature_names_in_ =
    ['size', 'bedrooms', 'bathrooms', 'latitude', 'longitude',
     'property_type', 'category']).
    """
    category: str = Field(
        ...,
        description="buy | rent | commercial_buy | commercial_rent",
    )
    property_type: str = Field(
        ...,
        description="Apartment | Villa | Office Space | Shop | …",
    )
    size: Union[float, str] = Field(
        ...,
        description="Area in m² (e.g. 130.0) or range string (e.g. '100-150').",
    )
    bedrooms: float = Field(
        ...,
        ge=0.0,
        le=20.0,
        description="Number of bedrooms. Use 1.0 for property types where this field is hidden.",
    )
    bathrooms: float = Field(
        ...,
        ge=0.0,
        le=20.0,
        description="Number of bathrooms. Use 1.0 for property types where this field is hidden.",
    )
    latitude: float = Field(
        ...,
        ge=22.0,
        le=32.0,
        description="WGS-84 latitude. Egypt bounds: 22° – 32° N.",
    )
    longitude: float = Field(
        ...,
        ge=24.0,
        le=38.0,
        description="WGS-84 longitude. Egypt bounds: 24° – 38° E.",
    )
    city_id: Optional[str] = Field(
        default=None,
        description="Optional city ID (e.g. 'new_cairo', 'sheikh_zayed') for regional metrics.",
    )


class ShapItem(BaseModel):
    feature: str
    feature_en: str
    amount: float
    pct: float
    type: str  # "base" | "positive" | "negative" | "total"


class FeatureImportanceItem(BaseModel):
    feature: str
    feature_en: str
    pct: float


class SimilarPropertyItem(BaseModel):
    id: int
    title: str
    size: float
    bedrooms: int
    bathrooms: int
    price: float
    price_formatted: str
    city: str
    image_url: Optional[str] = None


class MarketStats(BaseModel):
    city_name: str
    city_avg: float
    property_price: float
    city_max: float
    city_avg_formatted: str
    city_max_formatted: str


class PredictResponse(BaseModel):
    predicted_price: float = Field(description="Point estimate in EGP (or EGP/month for rent).")
    range_low: float = Field(description="Lower bound of the ±8% confidence range.")
    range_high: float = Field(description="Upper bound of the ±8% confidence range.")
    currency: str = Field(description="EGP or EGP/month.")
    confidence_pct: int = Field(default=87, description="Confidence score percentage (e.g. 87%).")
    meter_price: float = Field(default=0.0, description="Price per m².")
    area_comparison_pct: float = Field(default=0.0, description="Percentage compared to area average (e.g. +6.0).")
    market_stats: Optional[MarketStats] = Field(default=None, description="City market comparison statistics.")
    shap_breakdown: List[ShapItem] = Field(default_factory=list, description="SHAP feature contribution waterfall.")
    feature_importance: List[FeatureImportanceItem] = Field(default_factory=list, description="Global feature importance percentages.")
    similar_properties: List[SimilarPropertyItem] = Field(default_factory=list, description="Real similar properties from parquet.")
    scenario_delta: float = Field(default=0.0, description="Estimated price impact per additional room.")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(description="ok | degraded | error")
    model_loaded: bool = Field(description="True if the regression model loaded successfully.")
    llm_client_ready: bool = Field(description="True if the LLM client initialised successfully.")
    active_sessions: int = Field(description="Number of live chat sessions in memory.")
    llm_backend: str = Field(description="gemini | openai_compatible | unknown")


# ---------------------------------------------------------------------------
# Recommendations & Hybrid Recommendation System
# ---------------------------------------------------------------------------

class RecommendationFilterRequest(BaseModel):
    category: Optional[str] = Field(default="all", description="all | buy | rent | commercial_buy | commercial_rent")
    property_type: Optional[str] = Field(default="all", description="all | Apartment | Villa | ...")
    city: Optional[str] = Field(default="all", description="all | New Cairo City | Sheikh Zayed City | ...")
    price_range_id: Optional[str] = Field(default="all", description="Pre-bucketed price tier ID or 'all'")
    min_price: Optional[float] = Field(default=None, description="Optional minimum price")
    max_price: Optional[float] = Field(default=None, description="Optional maximum price")
    size_range_id: Optional[str] = Field(default="all", description="Pre-bucketed size tier ID or 'all'")
    min_size: Optional[float] = Field(default=None, description="Optional minimum size in m²")
    max_size: Optional[float] = Field(default=None, description="Optional maximum size in m²")
    bedrooms: Optional[Union[str, int, float]] = Field(default="all", description="Number of bedrooms or 'all'")
    bathrooms: Optional[Union[str, int, float]] = Field(default="all", description="Number of bathrooms or 'all'")
    amenities: Optional[List[str]] = Field(default_factory=list, description="List of requested amenities")
    sort: Optional[str] = Field(default="similarity", description="similarity | price_low | price_high")
    limit: Optional[int] = Field(default=6, ge=1, le=100, description="Page size")
    offset: Optional[int] = Field(default=0, ge=0, description="Offset for pagination")


class RecommendationCard(BaseModel):
    id: int
    title: str
    category: str
    category_ar: str
    category_en: str
    property_type: str
    city: str
    city_ar: str
    location: str
    latitude: float
    longitude: float
    price: float
    price_label_ar: str
    price_label_en: str
    size: float
    bedrooms: int
    bathrooms: int
    amenities: List[str] = Field(default_factory=list)
    image_url: str
    images: List[str] = Field(default_factory=list)
    similarity: float = Field(default=0.95)
    cluster: int = Field(default=0)


class RecommendationSearchResponse(BaseModel):
    status: str = Field(default="success")
    total: int = Field(description="Total matching properties across the full catalog")
    limit: int
    offset: int
    items: List[RecommendationCard]


class SimilarPropertiesResponse(BaseModel):
    status: str = Field(default="success")
    property_id: int
    cluster: int
    items: List[RecommendationCard]


