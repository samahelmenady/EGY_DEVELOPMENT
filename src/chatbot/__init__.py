"""
src/chatbot/__init__.py
Egyptian Real Estate Chatbot — public API surface.
"""
from src.chatbot.tools import (
    search_properties,
    get_breakdown,
    get_similar,
    suggest_next_question,
    relax_filters,
    resolve_location,
    validate_and_normalize_filters,
    build_tool_declarations,
    ARABIC_ALIASES,
    TOOL_DECLARATIONS,
    _lazy_declarations,
)

__all__ = [
    "search_properties",
    "get_breakdown",
    "get_similar",
    "suggest_next_question",
    "relax_filters",
    "resolve_location",
    "validate_and_normalize_filters",
    "build_tool_declarations",
    "ARABIC_ALIASES",
    "TOOL_DECLARATIONS",
]

