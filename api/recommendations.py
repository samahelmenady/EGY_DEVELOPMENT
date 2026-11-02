"""
api/recommendations.py — FastAPI router for property recommendations and hybrid similar properties.
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from core.recommendation_engine import recommendation_engine
from schemas import (
    RecommendationCard,
    RecommendationFilterRequest,
    RecommendationSearchResponse,
    SimilarPropertiesResponse,
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.post("/search", response_model=RecommendationSearchResponse)
def search_recommendations(req: RecommendationFilterRequest) -> RecommendationSearchResponse:
    """
    Search and filter properties across the 62,977-listing catalog using
    vectorized multi-criteria filtering and AI similarity scoring.
    """
    try:
        return recommendation_engine.search(req)
    except Exception as e:
        logger.error(f"Error in recommendation search: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=RecommendationSearchResponse)
def search_recommendations_get(
    category: Optional[str] = Query("all"),
    property_type: Optional[str] = Query("all"),
    city: Optional[str] = Query("all"),
    price_range_id: Optional[str] = Query("all"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    size_range_id: Optional[str] = Query("all"),
    min_size: Optional[float] = Query(None),
    max_size: Optional[float] = Query(None),
    bedrooms: Optional[str] = Query("all"),
    bathrooms: Optional[str] = Query("all"),
    amenities: Optional[List[str]] = Query(None),
    sort: Optional[str] = Query("similarity"),
    limit: int = Query(6, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> RecommendationSearchResponse:
    """
    GET variant of search for simple query-parameter based requests.
    """
    req = RecommendationFilterRequest(
        category=category,
        property_type=property_type,
        city=city,
        price_range_id=price_range_id,
        min_price=min_price,
        max_price=max_price,
        size_range_id=size_range_id,
        min_size=min_size,
        max_size=max_size,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        amenities=amenities or [],
        sort=sort,
        limit=limit,
        offset=offset,
    )
    return search_recommendations(req)


@router.get("/similar/{property_id}", response_model=SimilarPropertiesResponse)
def get_similar_properties(property_id: int, top_n: int = Query(6, ge=1, le=20)) -> SimilarPropertiesResponse:
    """
    Cascade Hybrid Recommendation for a specific property.
    K-Means Cluster filtering + Content-Based Cosine Similarity.
    """
    try:
        return recommendation_engine.recommend_similar(property_id, top_n=top_n)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Property ID {property_id} not found.")
    except Exception as e:
        logger.error(f"Error computing hybrid recommendations for {property_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class BatchPropertiesRequest(BaseModel):
    property_ids: list[int]


@router.post("/batch", response_model=list[RecommendationCard])
def get_properties_batch(body: BatchPropertiesRequest) -> list[RecommendationCard]:
    """
    Retrieve multiple real properties by ID list for user favorites.
    """
    results = []
    for pid in body.property_ids:
        prop = recommendation_engine.get_property(pid)
        if prop:
            results.append(prop)
    return results


@router.get("/featured/list", response_model=list[RecommendationCard])
def get_featured_properties(limit: int = 6) -> list[RecommendationCard]:
    """
    Retrieve featured real properties from parquet for initial user favorites.
    Curated set matches Chalet, Apartment, Twin House, and Villas from the user preferences design.
    """
    curated_ids = [8572018, 8698066, 8572009, 51121662, 52711116, 8702676]
    results = []
    for pid in curated_ids[:limit]:
        prop = recommendation_engine.get_property(int(pid))
        if prop:
            results.append(prop)

    # Fallback if fewer than limit
    if len(results) < limit:
        df = recommendation_engine.df
        for pid in df["id"].head(limit * 2):
            if int(pid) not in curated_ids:
                prop = recommendation_engine.get_property(int(pid))
                if prop:
                    results.append(prop)
                    if len(results) >= limit:
                        break

    return results


@router.get("/{property_id}", response_model=RecommendationCard)
def get_property_details(property_id: int) -> RecommendationCard:
    """
    Retrieve single property details by ID.
    """
    prop = recommendation_engine.get_property(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Property ID {property_id} not found.")
    return prop

