"""
src/chatbot/tools.py  —  Egyptian Real Estate Chatbot Tools
============================================================
All tools are pure Python, JSON-serialisable, and designed for
Gemini function-calling. No Gemini SDK imported.

Usage
-----
    from src.chatbot.tools import search_properties, TOOL_DECLARATIONS, ...

Configuration
-------------
All path-sensitive functions accept an optional ``_root`` argument (Path to
project root). Default is inferred from this file's location.
"""
from __future__ import annotations

import difflib
import json
import re
import warnings as _stdlib_warnings
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

# ── Project root ────────────────────────────────────────────────────────────
_ROOT: Path = Path(__file__).resolve().parents[2]

_PATHS: dict[str, Path] = {
    "parquet":     _ROOT / "data/processed/chat_bot/chatbot_properties_v2.parquet",
    "amenities":   _ROOT / "data/processed/chat_bot/amenities_mapping_v2.json",
    "loc_lookup":  _ROOT / "data/processed/chat_bot/location_lookup.csv",
    "feat_mat":    _ROOT / "models/recommendation/feature_matrix.npz",
    "id_to_idx":   _ROOT / "models/recommendation/id_to_idx.joblib",
    "idx_to_id":   _ROOT / "models/recommendation/idx_to_id.joblib",
    "top_indices": _ROOT / "models/recommendation/top_indices.npy",
    "top_scores":  _ROOT / "models/recommendation/top_scores.npy",
}

# ── Module-level cache ──────────────────────────────────────────────────────
_CACHE: dict[str, Any] = {}


# ── Loaders ─────────────────────────────────────────────────────────────────

def _df(root: Path = _ROOT) -> pd.DataFrame:
    """Load + cache + optimise the main properties table (categorical dtypes + id index)."""
    key = str(root) + "/df"
    if key not in _CACHE:
        p = _PATHS if root == _ROOT else _override_paths(root)
        df = pd.read_parquet(p["parquet"])
        for col in ("category", "property_type", "governorate",
                    "city", "district", "area", "currency"):
            if col in df.columns:
                df[col] = df[col].astype("category")
        # Pre-build id -> positional index for O(1) row lookup
        _CACHE[str(root) + "/id_row"] = {int(pid): i for i, pid in enumerate(df["id"])}
        _CACHE[key] = df
    return _CACHE[key]


def _id_row_map(root: Path = _ROOT) -> dict:
    """Return the cached id -> iloc-position map (built when df is loaded)."""
    _df(root)  # ensures map is populated
    return _CACHE[str(root) + "/id_row"]


def _amenities_map(root: Path = _ROOT) -> dict[str, dict]:
    """Load + cache amenity mapping; tolerates v1 (str values) and v2 (dict values)."""
    key = str(root) + "/amen"
    if key not in _CACHE:
        p = _PATHS if root == _ROOT else _override_paths(root)
        with open(p["amenities"], encoding="utf-8") as fh:
            raw = json.load(fh)
        out: dict[str, dict] = {}
        for code, val in raw.items():
            if isinstance(val, dict):
                out[code] = {
                    "name":     str(val["name"]),
                    "verified": bool(val.get("verified", False)),
                }
            else:  # v1: code -> name string
                out[code] = {
                    "name":     str(val),
                    "verified": "UNKNOWN" not in str(val).upper(),
                }
        _CACHE[key] = out
    return _CACHE[key]


def _feat_matrix(root: Path = _ROOT):
    """Load + cache precomputed top-indices/scores + id<->idx mappings."""
    key = str(root) + "/feat"
    if key not in _CACHE:
        p = _PATHS if root == _ROOT else _override_paths(root)
        id2idx      = joblib.load(str(p["id_to_idx"]))   # np.int64 keys
        idx_to_id_p = p.get("idx_to_id", p["id_to_idx"].parent / "idx_to_id.joblib")
        try:
            idx2id = joblib.load(str(idx_to_id_p))       # prebuilt reverse map
        except Exception:
            idx2id = {int(v): int(k) for k, v in id2idx.items()}
        # Precomputed top-50 similarity index (fastest path)
        top_idx    = np.load(str(p["top_indices"]))      # (N, 50)
        top_scores = np.load(str(p["top_scores"]))       # (N, 50) cosine scores
        _CACHE[key] = (id2idx, idx2id, top_idx, top_scores)
    return _CACHE[key]


def _override_paths(root: Path) -> dict[str, Path]:
    base = root / "data/processed/chat_bot"
    rec  = root / "models/recommendation"
    return {
        "parquet":     base / "chatbot_properties_v2.parquet",
        "amenities":   base / "amenities_mapping_v2.json",
        "loc_lookup":  base / "location_lookup.csv",
        "feat_mat":    rec  / "feature_matrix.npz",
        "id_to_idx":   rec  / "id_to_idx.joblib",
        "idx_to_id":   rec  / "idx_to_id.joblib",
        "top_indices": rec  / "top_indices.npy",
        "top_scores":  rec  / "top_scores.npy",
    }


# ── Category / amenity constants ────────────────────────────────────────────

_RESIDENTIAL_CATS:  frozenset = frozenset({"buy", "rent"})
_COMMERCIAL_CATS:   frozenset = frozenset({"commercial_buy", "commercial_rent"})
_ALL_CATS:          frozenset = _RESIDENTIAL_CATS | _COMMERCIAL_CATS

_RESIDENTIAL_CODES: frozenset = frozenset(
    {"BA", "SE", "BL", "AC", "BK", "BW", "SP", "SS", "WC", "ST", "CO", "PG", "VW", "MR", "PP"}
)
_COMMERCIAL_CODES:  frozenset = frozenset({"AN", "CR", "DN"})
_BOTH_CODES:        frozenset = frozenset({"CP", "LB", "SY"})


def _valid_codes_for_cats(cats: set[str]) -> frozenset:
    codes: set[str] = set(_BOTH_CODES)
    if cats & _RESIDENTIAL_CATS:
        codes |= _RESIDENTIAL_CODES
    if cats & _COMMERCIAL_CATS:
        codes |= _COMMERCIAL_CODES
    return frozenset(codes)


# ── Serialisation helpers ────────────────────────────────────────────────────

def _to_py(val: Any) -> Any:
    """Convert numpy scalars / NaN to native Python types for JSON output."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(float(val)) else float(val)
    if isinstance(val, float) and np.isnan(val):
        return None
    if isinstance(val, (np.bool_,)):
        return bool(val)
    return val


def _price_label(category: str) -> str:
    return "EGP / month" if str(category) in ("rent", "commercial_rent") else "EGP"


def _row_to_compact(row: pd.Series) -> dict:
    """Serialise a DataFrame row to the standard compact result dict."""
    imgs = row.get("images", [])
    if isinstance(imgs, np.ndarray):
        imgs = imgs.tolist()
    image_url = imgs[1] if len(imgs) > 1 else (imgs[0] if imgs else None)

    bed = _to_py(row.get("bedrooms"))
    return {
        "id":            int(row["id"]),
        "title":         str(row["title"]),
        "price":         _to_py(row.get("price")),
        "price_label":   _price_label(str(row["category"])),
        "property_type": str(row["property_type"]),
        "category":      str(row["category"]),
        "location":      str(row.get("location", "")),
        "bedrooms":      bed,
        "bathrooms":     _to_py(row.get("bathrooms")),
        "size":          _to_py(row.get("size")),
        "image_url":     image_url,
        "share_url":     str(row.get("share_url", "")),
    }


# ── Filter validation ────────────────────────────────────────────────────────

_KNOWN_FILTER_KEYS: frozenset = frozenset({
    "category", "property_type", "governorate", "city", "district", "area",
    "min_price", "max_price", "bedrooms", "min_bedrooms", "min_bathrooms",
    "min_size", "max_size", "amenities",
})


def validate_and_normalize_filters(
    filters: dict,
    root: Path = _ROOT,
) -> tuple[dict, list[str]]:
    """
    Validate and normalise a raw filter dict.

    - Drops unknown keys (with warning).
    - Normalises category / property_type to real data values.
    - Rejects unverified amenity names with a warning.
    - Flags min > max cross-key violations.

    Returns
    -------
    (clean_filters, warnings_list)
    """
    if not isinstance(filters, dict):
        return {}, ["filters must be a dict; received " + type(filters).__name__]

    warns: list[str] = []
    clean: dict = {}
    df = _df(root)
    amen = _amenities_map(root)

    real_cats   = set(df["category"].cat.categories)
    real_ptypes = set(df["property_type"].cat.categories)

    # Build readable-name -> code lookup for verified amenities only
    name_to_code: dict[str, str] = {
        meta["name"]: code
        for code, meta in amen.items()
        if meta["verified"]
    }

    for k, v in filters.items():
        if k not in _KNOWN_FILTER_KEYS:
            warns.append(f"Unknown filter key ignored: '{k}'")
            continue
        if v is None:
            continue

        if k == "category":
            v_str = str(v).strip().lower()
            if v_str in real_cats:
                clean[k] = v_str
            else:
                warns.append(
                    f"Unknown category '{v}' ignored. "
                    f"Valid values: {sorted(real_cats)}"
                )

        elif k == "property_type":
            items = [v] if isinstance(v, str) else list(v)
            good  = [p for p in items if p in real_ptypes]
            bad   = [p for p in items if p not in real_ptypes]
            if bad:
                warns.append(f"Unknown property_type(s) ignored: {bad}")
            if good:
                clean[k] = good

        elif k in ("governorate", "city", "district", "area"):
            clean[k] = str(v).strip()

        elif k in ("min_price", "max_price", "min_size", "max_size",
                   "bedrooms", "min_bedrooms", "min_bathrooms"):
            try:
                clean[k] = float(v)
            except (TypeError, ValueError):
                warns.append(f"'{k}' must be numeric; '{v}' ignored")

        elif k == "amenities":
            items = [v] if isinstance(v, str) else list(v)
            good, bad = [], []
            for name in items:
                if name in name_to_code:
                    good.append(name)
                else:
                    bad.append(name)
            if bad:
                warns.append(
                    f"Rejected unverified/unknown amenity name(s): {bad}. "
                    f"Use only verified amenity names."
                )
            if good:
                clean[k] = good

    # Cross-key: min > max violations
    for lo, hi in [("min_price", "max_price"), ("min_size", "max_size")]:
        if lo in clean and hi in clean and clean[lo] > clean[hi]:
            warns.append(
                f"{lo} ({clean[lo]:,.0f}) > {hi} ({clean[hi]:,.0f}); "
                "both removed"
            )
            clean.pop(lo); clean.pop(hi)

    return clean, warns


# ── Internal filter application ──────────────────────────────────────────────

def _apply_filters(df: pd.DataFrame, filters: dict, amen: dict) -> pd.DataFrame:
    """Apply a CLEAN (already validated) filter dict to a DataFrame."""
    name_to_code: dict[str, str] = {
        meta["name"]: code for code, meta in amen.items() if meta["verified"]
    }
    m = pd.Series(True, index=df.index)

    for k, v in filters.items():
        if k == "category":
            m &= df["category"] == v
        elif k == "property_type":
            m &= df["property_type"].isin(v)
        elif k == "governorate":
            m &= df["governorate"].str.lower() == str(v).lower()
        elif k == "city":
            m &= df["city"].str.lower() == str(v).lower()
        elif k == "district":
            col = df.get("district", pd.Series(dtype=object))
            m &= df["district"].str.lower() == str(v).lower()
        elif k == "area":
            m &= df["area"].str.lower() == str(v).lower()
        elif k == "min_price":
            m &= df["price"] >= v
        elif k == "max_price":
            m &= df["price"] <= v
        elif k == "bedrooms":
            m &= df["bedrooms"] == v
        elif k == "min_bedrooms":
            m &= df["bedrooms"] >= v
        elif k == "min_bathrooms":
            m &= df["bathrooms"] >= v
        elif k == "min_size":
            m &= df["size"] >= v
        elif k == "max_size":
            m &= df["size"] <= v
        elif k == "amenities":
            codes = [name_to_code[n] for n in v if n in name_to_code]
            for code in codes:
                m &= df["amenities"].apply(lambda x: code in (x.tolist() if isinstance(x, np.ndarray) else list(x)))

    return df[m]


# ── 1. search_properties ────────────────────────────────────────────────────

def search_properties(
    filters: dict,
    sort_by:  str = "relevance",
    limit:    int = 5,
    root:     Path = _ROOT,
) -> dict:
    """
    Search Egyptian real estate listings with structured filters.

    Parameters
    ----------
    filters : dict
        Any subset of: category, property_type, governorate, city, district,
        area, min_price, max_price, bedrooms, min_bedrooms, min_bathrooms,
        min_size, max_size, amenities (verified readable names).
    sort_by : str
        "relevance" | "price_asc" | "price_desc" | "size_desc"
    limit : int
        Results to return; capped at 10.

    Returns
    -------
    dict
        total_matches, applied_filters, warnings, results (compact dicts).
        Each result has: id, title, price, price_label, property_type,
        category, location, bedrooms, bathrooms, size, image_url, share_url.
        ``price_label`` is "EGP" for sale or "EGP / month" for rent.
        ``bedrooms`` is null for commercial property types that have none.
        ``image_url`` is always the 668×452 display image.
    """
    limit = max(1, min(int(limit), 10))
    clean, warns = validate_and_normalize_filters(filters, root)
    df  = _df(root)
    amen = _amenities_map(root)
    sub = _apply_filters(df, clean, amen)

    _sort = {
        "price_asc":  ("price", True),
        "price_desc": ("price", False),
        "size_desc":  ("size", False),
    }
    if sort_by in _sort:
        col, asc = _sort[sort_by]
        sub = sub.sort_values(col, ascending=asc, na_position="last")

    results = [_row_to_compact(row) for _, row in sub.head(limit).iterrows()]
    return {
        "total_matches":   int(len(sub)),
        "applied_filters": clean,
        "warnings":        warns,
        "results":         results,
    }


# ── 2. get_breakdown ────────────────────────────────────────────────────────

_VALID_BY: frozenset = frozenset({
    "area", "district", "city", "governorate",
    "property_type", "bedrooms", "category",
})


def get_breakdown(
    filters: dict,
    by:      str,
    top_k:   int = 8,
    root:    Path = _ROOT,
) -> dict:
    """
    Count + price-summarise properties grouped by a single dimension.

    Parameters
    ----------
    filters : dict   Same filter dict as search_properties.
    by : str         One of: area / district / city / governorate /
                     property_type / bedrooms / category.
    top_k : int      Return this many groups (sorted by count desc).

    Returns
    -------
    dict
        total, by, warnings, groups (list of
        {value, count, min_price, median_price, max_price}).
    """
    if by not in _VALID_BY:
        return {"error": f"'by' must be one of {sorted(_VALID_BY)}", "groups": []}

    clean, warns = validate_and_normalize_filters(filters, root)
    df   = _df(root)
    amen = _amenities_map(root)
    sub  = _apply_filters(df, clean, amen)

    if by not in sub.columns:
        return {"error": f"Column '{by}' not in data", "groups": []}

    grp = sub.groupby(by, observed=True, dropna=False)["price"]
    agg = grp.agg(
        count="count",
        min_price="min",
        median_price="median",
        max_price="max",
    ).reset_index().sort_values("count", ascending=False).head(int(top_k))

    groups = []
    for _, row in agg.iterrows():
        val = row[by]
        if isinstance(val, float) and np.isnan(val):
            val = None
        elif pd.isna(val):
            val = None
        else:
            val = str(val) if not isinstance(val, (int, float)) else _to_py(val)
        groups.append({
            "value":        val,
            "count":        int(row["count"]),
            "min_price":    _to_py(row["min_price"]),
            "median_price": _to_py(row["median_price"]),
            "max_price":    _to_py(row["max_price"]),
        })

    return {
        "total":    int(len(sub)),
        "by":       by,
        "warnings": warns,
        "groups":   groups,
    }


# ── 3. get_similar ──────────────────────────────────────────────────────────

def get_similar(
    property_id:   int,
    n:             int  = 5,
    same_category: bool = True,
    root:          Path = _ROOT,
) -> dict:
    """
    Return the n most similar properties using the precomputed top-50
    similarity index at models/recommendation/top_indices.npy and
    top_scores.npy. No retraining, no modification of model files.

    Parameters
    ----------
    property_id : int   The ``id`` of the reference property.
    n : int             Max similar properties to return (capped at 20).
    same_category : bool  Restrict to same category as the reference.

    Returns
    -------
    dict
        reference_id, reference_title, same_category, similar (compact dicts
        with an extra ``similarity`` float in [0, 1]).
    """
    n   = max(1, min(int(n), 20))
    df  = _df(root)
    id2idx, idx2id, top_idx, top_scores = _feat_matrix(root)

    pid = int(property_id)
    # id2idx keys are np.int64; look up with int or np.int64
    ref_idx_val = id2idx.get(pid) if pid in id2idx else id2idx.get(np.int64(pid))
    if ref_idx_val is None:
        return {"error": f"property_id {pid} not found in recommendation index"}

    id_row = _id_row_map(root)
    ref_row_pos = id_row.get(pid)
    if ref_row_pos is None:
        return {"error": f"property_id {pid} not found in parquet"}
    ref_row = df.iloc[ref_row_pos]
    ref_idx = int(ref_idx_val)

    # Use precomputed top-50 neighbours (row = ref_idx; cols = neighbour indices)
    neighbour_indices = top_idx[ref_idx]     # shape (50,), int
    neighbour_scores  = top_scores[ref_idx]  # shape (50,), float

    ref_cat = str(ref_row["category"])
    results: list[dict] = []

    for nb_idx, score in zip(neighbour_indices, neighbour_scores):
        if len(results) >= n:
            break
        nb_idx = int(nb_idx)
        if nb_idx == ref_idx:
            continue
        # O(1) lookup via pre-built id->row map
        cand_pid = idx2id.get(nb_idx)
        if cand_pid is None:
            continue
        cand_pid = int(cand_pid)
        cand_row_pos = id_row.get(cand_pid)
        if cand_row_pos is None:
            continue
        cand_row = df.iloc[cand_row_pos]
        if same_category and str(cand_row["category"]) != ref_cat:
            continue
        compact = _row_to_compact(cand_row)
        compact["similarity"] = round(float(score), 4)
        results.append(compact)

    return {
        "reference_id":    pid,
        "reference_title": str(ref_row["title"]),
        "same_category":   same_category,
        "similar":         results,
    }


# ── 4. suggest_next_question ─────────────────────────────────────────────────

_SLOT_PRIORITY: list[str] = [
    "category", "property_type", "governorate", "city",
    "district", "area", "min_price", "bedrooms", "min_size", "amenities",
]

_SLOT_REASONS: dict[str, str] = {
    "category":      "Transaction type (buy/rent/commercial) has the biggest impact on results",
    "property_type": "Property type narrows the listing type significantly",
    "governorate":   "Governorate sets the region and drastically narrows the search",
    "city":          "City narrows to a specific urban area",
    "district":      "District/neighbourhood pinpoints the exact sub-area",
    "area":          "Compound or micro-area gives very precise results",
    "min_price":     "Budget range would split results into affordable bands",
    "bedrooms":      "Bedroom count narrows residential listings significantly",
    "min_size":      "Size requirement filters out unsuitable properties",
    "amenities":     "Amenities filter down to lifestyle-matching properties",
}


def suggest_next_question(
    filters: dict,
    root:    Path = _ROOT,
) -> dict:
    """
    Rule-based advisor: which missing filter slot would narrow results most?

    Rules:
    - Never suggests bedrooms for commercial categories.
    - For amenities, only offers verified codes valid for the current
      category group (residential vs commercial vs mixed).
    - Budget options are real quantile ranges of current matches.

    Returns
    -------
    dict  slot, reason, options (list of {value, count}), warnings.
    """
    clean, warns = validate_and_normalize_filters(filters, root)
    df    = _df(root)
    amen  = _amenities_map(root)
    sub   = _apply_filters(df, clean, amen)
    n_now = len(sub)

    cat          = clean.get("category")
    is_commercial = cat in _COMMERCIAL_CATS if cat else None

    name_to_code = {meta["name"]: code for code, meta in amen.items() if meta["verified"]}

    for slot in _SLOT_PRIORITY:
        # Skip already-applied slots (except budget: check both min/max)
        if slot in ("min_price",):
            if "min_price" in clean or "max_price" in clean:
                continue
        elif slot in clean:
            continue

        # Never suggest bedrooms for commercial
        if slot == "bedrooms" and is_commercial:
            continue

        # ── amenities ──
        if slot == "amenities":
            cats = {cat} if cat else set(_ALL_CATS)
            valid_codes = _valid_codes_for_cats(cats)
            options: list[dict] = []
            for code, meta in amen.items():
                if not meta["verified"] or code not in valid_codes:
                    continue
                name = meta["name"]
                count = int(sub["amenities"].apply(
                    lambda x: code in (x.tolist() if isinstance(x, np.ndarray) else list(x))
                ).sum())
                options.append({"value": name, "count": count})
            options.sort(key=lambda x: -x["count"])
            options = options[:8]
            if not options:
                continue
            return {
                "slot":    "amenities",
                "reason":  f"Amenities would further narrow the {n_now:,} matching properties",
                "options": options,
                "warnings": warns,
            }

        # ── budget: quantile bands ──
        if slot == "min_price":
            prices = sub["price"].dropna()
            if len(prices) < 4:
                continue
            qs = prices.quantile([0.0, 0.25, 0.5, 0.75, 1.0])
            options = []
            labels = ["Under Q1", "Q1–Q2", "Q2–Q3", "Q3+"]
            for i in range(4):
                lo = int(qs.iloc[i])
                hi = int(qs.iloc[i + 1])
                cnt = int(((prices >= lo) & (prices <= hi)).sum())
                options.append({"value": f"{lo:,}–{hi:,} EGP", "count": cnt})
            return {
                "slot":    "budget",
                "reason":  _SLOT_REASONS["min_price"],
                "options": options,
                "warnings": warns,
            }

        # ── generic categorical slot ──
        if slot in sub.columns:
            valid = sub[slot].dropna()
            if valid.empty:
                continue
            vc = valid.value_counts(dropna=True).head(8)
            if len(vc) <= 1:
                continue  # already fully determined by current filters
            options = [{"value": str(v), "count": int(c)} for v, c in vc.items()]
            return {
                "slot":    slot,
                "reason":  _SLOT_REASONS.get(slot, f"Filtering by '{slot}' narrows results"),
                "options": options,
                "warnings": warns,
            }

    return {
        "slot":    None,
        "reason":  "All major slots are set; try adjusting price or size range",
        "options": [],
        "warnings": warns,
    }


# ── 5. relax_filters ────────────────────────────────────────────────────────

def relax_filters(
    filters: dict,
    root:    Path = _ROOT,
) -> dict:
    """
    Progressively relax filters until ≥ 1 result is found.

    Relaxation order (stops at first success):
      1. Drop amenities
      2. max_price × 1.20  /  min_price × 0.80
      3. min_size × 0.80   /  max_size × 1.20
      4. area → district → city (drop the tightest location)
      5. bedrooms / min_bedrooms − 1

    Never relaxes ``category``.

    Returns
    -------
    dict  relaxed_filters, changes (human-readable list), total_matches, results (up to 5), warnings.
    """
    clean, warns = validate_and_normalize_filters(filters, root)
    df    = _df(root)
    amen  = _amenities_map(root)

    def _try(f: dict) -> int:
        return len(_apply_filters(df, f, amen))

    def _done(f: dict, changes: list) -> dict:
        sub = _apply_filters(df, f, amen)
        return {
            "relaxed_filters": f,
            "changes":         changes,
            "total_matches":   int(len(sub)),
            "results":         [_row_to_compact(r) for _, r in sub.head(5).iterrows()],
            "warnings":        warns,
        }

    if _try(clean) > 0:
        return _done(clean, [])

    changes: list[str] = []
    cur = dict(clean)

    # Step 1: drop amenities
    if "amenities" in cur:
        cur.pop("amenities")
        changes.append("Removed amenity filters")
        if _try(cur) > 0:
            return _done(cur, changes)

    # Step 2: relax budget
    if "max_price" in cur:
        old = cur["max_price"]
        cur["max_price"] = cur["max_price"] * 1.20
        changes.append(f"Increased max budget by 20%: {old:,.0f} → {cur['max_price']:,.0f} EGP")
        if _try(cur) > 0:
            return _done(cur, changes)

    if "min_price" in cur:
        old = cur["min_price"]
        cur["min_price"] = cur["min_price"] * 0.80
        changes.append(f"Decreased min price by 20%: {old:,.0f} → {cur['min_price']:,.0f} EGP")
        if _try(cur) > 0:
            return _done(cur, changes)

    # Step 3: relax size
    if "min_size" in cur:
        old = cur["min_size"]
        cur["min_size"] = cur["min_size"] * 0.80
        changes.append(f"Decreased min size by 20%: {old:.0f} → {cur['min_size']:.0f} sqm")
        if _try(cur) > 0:
            return _done(cur, changes)

    if "max_size" in cur:
        old = cur["max_size"]
        cur["max_size"] = cur["max_size"] * 1.20
        changes.append(f"Increased max size by 20%: {old:.0f} → {cur['max_size']:.0f} sqm")
        if _try(cur) > 0:
            return _done(cur, changes)

    # Step 4: widen location  area → district → city
    if "area" in cur:
        removed = cur.pop("area")
        changes.append(f"Widened: removed area filter '{removed}' (searching district-wide)")
        if _try(cur) > 0:
            return _done(cur, changes)

    if "district" in cur:
        removed = cur.pop("district")
        changes.append(f"Widened: removed district filter '{removed}' (searching city-wide)")
        if _try(cur) > 0:
            return _done(cur, changes)

    if "city" in cur and "governorate" in cur:
        removed = cur.pop("city")
        changes.append(f"Widened: removed city filter '{removed}' (searching governorate-wide)")
        if _try(cur) > 0:
            return _done(cur, changes)

    # Step 5: relax bedrooms
    for bkey in ("bedrooms", "min_bedrooms"):
        if bkey in cur and cur[bkey] > 1:
            old = int(cur[bkey])
            cur[bkey] = cur[bkey] - 1
            changes.append(f"Decreased {bkey} by 1: {old} → {int(cur[bkey])}")
            if _try(cur) > 0:
                return _done(cur, changes)

    # Nothing worked
    return {
        "relaxed_filters": cur,
        "changes":         changes,
        "total_matches":   0,
        "results":         [],
        "warnings":        warns + [
            "No results even after relaxing all filters. "
            "Try a different category, governorate, or remove all location filters."
        ],
    }


# ── 6. resolve_location ─────────────────────────────────────────────────────

# Arabic ↔ English alias dictionary (built from real data values).
# Main cities, districts, popular compounds. Shows for user review in notebook.
ARABIC_ALIASES: dict[str, str] = {
    # ── Governorates ──────────────────────────────────────────────
    "القاهرة":         "Cairo",
    "الجيزة":          "Giza",
    "الإسكندرية":      "Alexandria",
    "اسكندرية":        "Alexandria",
    "السويس":          "Suez",
    "البحر الأحمر":    "Red Sea",
    "الساحل الشمالي":  "North Coast",
    "الساحل":          "North Coast",
    "القليوبية":       "Qalyubia",
    "الشرقية":         "Sharqia",
    "الدقهلية":        "Al Daqahlya",
    "المنوفية":        "Al Menofeya",
    "الفيوم":          "Al Fayum",
    "دمياط":           "Demyat",
    "جنوب سيناء":      "South Sainai",
    "أسيوط":           "Asyut",
    "مطروح":           "Matrouh",
    # ── Cities ────────────────────────────────────────────────────
    "التجمع الخامس":    "New Cairo City",
    "التجمع":           "New Cairo City",
    "القاهرة الجديدة":  "New Cairo City",
    "نيو كايرو":        "New Cairo City",
    # English near-miss hard aliases
    "new cairo":        "New Cairo City",
    "new cairo city":   "New Cairo City",
    "sheikh zayed":     "Sheikh Zayed City",
    "6th october":      "6 October City",
    "6 october":        "6 October City",
    "الشيخ زايد":       "Sheikh Zayed City",
    "شيخ زايد":         "Sheikh Zayed City",
    "٦ أكتوبر":         "6 October City",
    "6 أكتوبر":         "6 October City",
    "سادس أكتوبر":      "6 October City",
    "أكتوبر":           "6 October City",
    "المعادي":          "Hay El Maadi",
    "معادي":            "Hay El Maadi",
    "مدينتي":           "Madinaty",
    "العاصمة الإدارية":  "New Capital City",
    "العاصمة":           "New Capital City",
    "الغردقة":           "Hurghada",
    "العين السخنة":      "Al Ain Al Sokhna",
    "السخنة":            "Al Ain Al Sokhna",
    "مدينة نصر":         "Nasr City",
    "نصر سيتي":          "Nasr City",
    "النزهة":            "El Nozha",
    "الشروق":            "Shorouk City",
    "شروق":              "Shorouk City",
    "الزمالك":           "Zamalek",
    "هليوبوليس":         "Heliopolis - Masr El Gedida",
    "مصر الجديدة":       "Heliopolis - Masr El Gedida",
    "المهندسين":         "Mohandessin",
    "الدقي":             "Dokki",
    "المستقبل":          "Mostakbal City - Future City",
    "مستقبل":            "Mostakbal City - Future City",
    "الرحاب":            "El Rehab",
    "وسط البلد":         "Abdeen",
    "بدر":               "Badr City",
    # ── Districts / Neighbourhoods ─────────────────────────────────
    "التجمع الأول":      "1st Settlement",
    "التسوية الخامسة":   "The 5th Settlement",
    "القطامية":          "Katameya",
    "البساتين":          "El Basateen",
    "حلوان":             "Helwan",
    "المقطم":            "Mokattam",
    "عين شمس":           "Ain Shams",
    "شبرا":              "Shubra",
    "امبابة":            "Imbaba",
    "العجوزة":           "Agouza",
    "الحدائق":           "El Hadayek",
    "الدبلوماسيين":      "Diplomatic Quarter",
    # ── Popular compounds / areas ──────────────────────────────────
    "ميفيدا":            "Mivida",
    "إيستاون":           "Eastown",
    "هايد بارك":         "Hyde Park",
    "فيلايت":            "Villette",
    "أو ويست":           "O West",
    "كايرو فيستيفال سيتي": "Cairo Festival City",
    "برايفادو":          "Privado",
    "ديستريكت ٥":        "District 5",
    "نيو جيزة":          "New Giza",
    "بالم هيلز":         "Palm Hills New Cairo",
    "ماونتن فيو":        "Mountain View iCity",
}


def _build_location_tables(root: Path = _ROOT) -> tuple[dict[str, str], list[str]]:
    """Build and cache {lower_stripped -> canonical} + list of all canonicals."""
    key = str(root) + "/loc_tables"
    if key not in _CACHE:
        df = _df(root)
        canonicals: set[str] = set()
        for col in ("governorate", "city", "district", "area"):
            if col in df.columns:
                canonicals.update(
                    str(v) for v in df[col].dropna().unique()
                )
        canon_map = {v.lower().strip(): v for v in canonicals}
        _CACHE[key] = (canon_map, list(canonicals))
    return _CACHE[key]


def _guess_column(df: pd.DataFrame, value: str) -> str:
    """Guess which location column a canonical value belongs to."""
    for col in ("area", "district", "city", "governorate"):
        if col in df.columns and (df[col] == value).any():
            return col
    return "unknown"


def resolve_location(
    text:      str,
    threshold: float = 0.6,
    root:      Path  = _ROOT,
) -> dict:
    """
    Map free-form Arabic or English location text to canonical values.

    Steps:
    1. Exact match against ARABIC_ALIASES.
    2. Case/whitespace-insensitive exact match against real data values.
    3. difflib fuzzy match (cutoff = threshold).

    Returns
    -------
    dict
        input, found (bool), ambiguous (bool),
        matches (up to 5 × {value, column_hint, confidence, source}).
    """
    canon_map, _ = _build_location_tables(root)
    df = _df(root)

    query      = str(text).strip()
    query_norm = query.lower().strip()
    matches:   list[dict] = []

    # Step 1: Arabic alias exact match
    for ar, en in ARABIC_ALIASES.items():
        if query_norm == ar.lower().strip():
            hint = _guess_column(df, en)
            if not any(m["value"] == en for m in matches):
                matches.append({
                    "value":       en,
                    "column_hint": hint,
                    "confidence":  1.0,
                    "source":      "arabic_alias",
                })

    # Step 2: normalised exact match in real values
    if query_norm in canon_map:
        en   = canon_map[query_norm]
        hint = _guess_column(df, en)
        if not any(m["value"] == en for m in matches):
            matches.append({
                "value":       en,
                "column_hint": hint,
                "confidence":  1.0,
                "source":      "exact_match",
            })

    # Step 3: fuzzy match
    if not matches:
        close = difflib.get_close_matches(
            query_norm, list(canon_map.keys()), n=6, cutoff=threshold
        )
        for cand_norm in close:
            en    = canon_map[cand_norm]
            score = difflib.SequenceMatcher(None, query_norm, cand_norm).ratio()
            hint  = _guess_column(df, en)
            if not any(m["value"] == en for m in matches):
                matches.append({
                    "value":       en,
                    "column_hint": hint,
                    "confidence":  round(score, 3),
                    "source":      "fuzzy_match",
                })

    matches.sort(key=lambda x: -x["confidence"])

    return {
        "input":     query,
        "found":     len(matches) > 0,
        "ambiguous": len(matches) > 1,
        "matches":   matches[:5],
    }


# ── Tool declarations ────────────────────────────────────────────────────────

def build_tool_declarations(root: Path = _ROOT) -> list[dict]:
    """
    Build Gemini-compatible function-declaration dicts from real data.

    - Enums are derived from actual data values.
    - Amenity enum contains ONLY verified names.
    - price_period and price_type are excluded.
    """
    df         = _df(root)
    amen       = _amenities_map(root)
    cats       = sorted(str(v) for v in df["category"].cat.categories)
    ptypes     = sorted(str(v) for v in df["property_type"].cat.categories)
    govs       = sorted(str(v) for v in df["governorate"].cat.categories)
    amen_enum  = sorted(meta["name"] for meta in amen.values() if meta["verified"])

    _filter_schema = {
        "type": "object",
        "properties": {
            "category": {
                "type": "string", "enum": cats,
                "description": "Transaction type. Required for bedrooms filter (only residential).",
            },
            "property_type": {
                "oneOf": [
                    {"type": "string", "enum": ptypes},
                    {"type": "array",  "items": {"type": "string", "enum": ptypes}},
                ],
                "description": "Property subtype(s). Can be a string or list.",
            },
            "governorate":   {"type": "string", "enum": govs},
            "city":          {"type": "string",
                              "description": "City / large district (e.g. New Cairo City, Sheikh Zayed City)"},
            "district":      {"type": "string",
                              "description": "Sub-city district or neighbourhood (e.g. The 5th Settlement)"},
            "area":          {"type": "string",
                              "description": "Compound or micro-area name (e.g. Mivida, Hyde Park)"},
            "min_price":     {"type": "number", "description": "Minimum price in EGP"},
            "max_price":     {"type": "number", "description": "Maximum price in EGP"},
            "bedrooms":      {"type": "number",
                              "description": "Exact bedroom count. NEVER set for commercial categories."},
            "min_bedrooms":  {"type": "number"},
            "min_bathrooms": {"type": "number"},
            "min_size":      {"type": "number", "description": "Minimum floor area in sqm"},
            "max_size":      {"type": "number", "description": "Maximum floor area in sqm"},
            "amenities": {
                "type": "array",
                "items": {"type": "string", "enum": amen_enum},
                "description": (
                    "Property MUST have ALL listed amenities. "
                    "Only verified amenity names allowed. "
                    "Use residential names (Balcony, Shared Pool, etc.) for buy/rent; "
                    "use commercial names (Conference Room, Annex Room, Dining Room) for commercial."
                ),
            },
        },
    }

    return [
        {
            "name": "search_properties",
            "description": (
                "Search Egyptian real estate listings with structured filters. "
                "Call when the user specifies concrete criteria: location, price, size, "
                "bedrooms, amenities, or property type. "
                "Returns results with price_label (EGP for sale, EGP/month for rent), "
                "image_url (668×452), and share_url. "
                "bedrooms may be null for commercial listings — that is normal."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "filters": _filter_schema,
                    "sort_by": {
                        "type": "string",
                        "enum": ["relevance", "price_asc", "price_desc", "size_desc"],
                    },
                    "limit": {"type": "integer", "minimum": 1, "maximum": 10, "default": 5},
                },
                "required": ["filters"],
            },
        },
        {
            "name": "get_breakdown",
            "description": (
                "Aggregate property counts and price stats grouped by one dimension. "
                "Use for: 'how many villas in New Cairo?', 'price range by district?', "
                "'which areas have the most apartments?'"
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "filters": _filter_schema,
                    "by": {
                        "type": "string",
                        "enum": sorted(_VALID_BY),
                        "description": "Grouping column.",
                    },
                    "top_k": {"type": "integer", "minimum": 1, "maximum": 20, "default": 8},
                },
                "required": ["filters", "by"],
            },
        },
        {
            "name": "get_similar",
            "description": (
                "Find properties similar to a specific listing using the recommendation model. "
                "Call after presenting a property to offer alternatives."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "property_id":   {"type": "integer", "description": "The `id` field of the reference listing"},
                    "n":             {"type": "integer", "minimum": 1, "maximum": 20, "default": 5},
                    "same_category": {"type": "boolean", "default": True},
                },
                "required": ["property_id"],
            },
        },
        {
            "name": "suggest_next_question",
            "description": (
                "Rule-based advisor: identifies which unanswered filter slot "
                "would narrow results most. Returns real value options with counts. "
                "Call when results > 20 or the conversation stalls. "
                "Bedrooms is never suggested for commercial categories."
            ),
            "parameters": {
                "type": "object",
                "properties": {"filters": _filter_schema},
                "required": ["filters"],
            },
        },
        {
            "name": "relax_filters",
            "description": (
                "When search_properties returns 0 results, call this to progressively "
                "loosen filters and find the first relaxed set that has matches. "
                "Shows exactly what changed in human-readable form. "
                "Never relaxes category."
            ),
            "parameters": {
                "type": "object",
                "properties": {"filters": _filter_schema},
                "required": ["filters"],
            },
        },
        {
            "name": "resolve_location",
            "description": (
                "Translate Arabic, misspelled, or vague location text to canonical "
                "governorate / city / district / area values. "
                "Always call before searching when the location is in Arabic or ambiguous. "
                "Returns column_hint so you know which filter key to set."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "text":      {"type": "string", "description": "Free-form location text in any language"},
                    "threshold": {"type": "number", "minimum": 0.0, "maximum": 1.0, "default": 0.6},
                },
                "required": ["text"],
            },
        },
    ]


# Build declarations lazily on first import access
def _lazy_declarations():
    global TOOL_DECLARATIONS
    if not TOOL_DECLARATIONS:
        try:
            TOOL_DECLARATIONS = build_tool_declarations()
        except Exception:
            TOOL_DECLARATIONS = []


TOOL_DECLARATIONS: list[dict] = []
_lazy_declarations()
