"""Shared service-family overrides for the public tile and reader experience.

The taxonomy shifts only selected public identities into the service that best
explains them. It never changes their route, source ID, or protected app code.
"""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlsplit


APP = Path(__file__).resolve().parents[1]
_TAXONOMY = json.loads((APP / "preview-content" / "service-taxonomy.json").read_text())
_IDENTITY_FAMILIES = _TAXONOMY["identityFamilies"]
_PATH_FAMILIES = _TAXONOMY["pathFamilies"]
_PATH_PREFIX_FAMILIES = tuple(
    sorted(_TAXONOMY["pathPrefixFamilies"].items(), key=lambda item: len(item[0]), reverse=True)
)
_FAMILIES = {"web", "it", "consulting", "software", "brand"}


def _path(value: str) -> str:
    path = urlsplit(str(value or "")).path
    return (path.rstrip("/") or "/") + ("" if path == "/" else "/")


def override_family(identity: str = "", path: str = "") -> str | None:
    """Return an explicit service family for a public identity or route.

    Identity is intentionally checked first: a preserved route can still carry
    a specific public reader meaning. ``None`` leaves the source's existing
    family untouched.
    """
    family = _IDENTITY_FAMILIES.get(str(identity or ""))
    if family:
        return family
    normalized = _path(path)
    family = _PATH_FAMILIES.get(normalized)
    if family:
        return family
    for prefix, candidate in _PATH_PREFIX_FAMILIES:
        if normalized.startswith(prefix):
            return candidate
    return None


def _validate() -> None:
    for collection in (_IDENTITY_FAMILIES, _PATH_FAMILIES, dict(_PATH_PREFIX_FAMILIES)):
        unknown = set(collection.values()) - _FAMILIES
        if unknown:
            raise ValueError(f"Unknown service family: {sorted(unknown)}")


_validate()
