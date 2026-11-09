#!/usr/bin/env python3
"""Validated HTML fragments for the homepage process and named-work proof.

The tile compiler owns placement. This module owns the public-copy contract so
the same approved process language is not retyped in several templates.
"""

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from typing import Any


REQUIRED_PROCESS_KEYS = {"eyebrow", "heading", "intro", "steps", "action"}
REQUIRED_STEP_KEYS = {"number", "title", "body"}
REQUIRED_ACTION_KEYS = {"href", "label"}
REQUIRED_CASE_KEYS = {"client", "caseHref", "summary", "sourceHref", "sourceLabel", "verifiedAt"}
REQUIRED_CASE_PROOF_KEYS = {"eyebrow", "heading", "sourcePrefix", "checkedPrefix", "items"}


def _text(value: object, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be non-empty text")
    return value.strip()


def _href(value: object, field: str) -> str:
    href = _text(value, field)
    if not (href.startswith("/") or href.startswith("https://")):
        raise ValueError(f"{field} must be an internal path or HTTPS URL")
    return href


def load_homepage_proof(path: Path) -> dict[str, Any]:
    source = json.loads(path.read_text())
    if source.get("version") != 1:
        raise ValueError("homepage proof version must be 1")
    policy = _text(source.get("sourcePolicy"), "sourcePolicy")
    if "never assigned" not in policy:
        raise ValueError("sourcePolicy must prohibit assigning generic reviews to a named client")

    process = source.get("process")
    if not isinstance(process, dict) or set(process) != REQUIRED_PROCESS_KEYS:
        raise ValueError("process must contain only its approved fields")
    for key in ("eyebrow", "heading", "intro"):
        _text(process.get(key), f"process.{key}")
    steps = process.get("steps")
    if not isinstance(steps, list) or len(steps) != 3:
        raise ValueError("process must contain exactly three steps")
    if [step.get("number") for step in steps if isinstance(step, dict)] != ["01", "02", "03"]:
        raise ValueError("process steps must be numbered 01, 02, 03")
    for index, step in enumerate(steps, start=1):
        if not isinstance(step, dict) or set(step) != REQUIRED_STEP_KEYS:
            raise ValueError(f"process step {index} has unexpected fields")
        for key in REQUIRED_STEP_KEYS:
            _text(step.get(key), f"process.steps[{index}].{key}")
    action = process.get("action")
    if not isinstance(action, dict) or set(action) != REQUIRED_ACTION_KEYS:
        raise ValueError("process action has unexpected fields")
    _href(action.get("href"), "process.action.href")
    _text(action.get("label"), "process.action.label")

    case_proof = source.get("caseProof")
    if not isinstance(case_proof, dict) or set(case_proof) != REQUIRED_CASE_PROOF_KEYS:
        raise ValueError("caseProof must contain only its approved fields")
    for key in ("eyebrow", "heading", "sourcePrefix", "checkedPrefix"):
        _text(case_proof.get(key), f"caseProof.{key}")
    items = case_proof.get("items")
    if not isinstance(items, list) or len(items) != 2:
        raise ValueError("caseProof must contain exactly two named public records")
    for index, case in enumerate(items, start=1):
        if not isinstance(case, dict) or set(case) != REQUIRED_CASE_KEYS:
            raise ValueError(f"caseProof.items[{index}] has unexpected fields")
        _text(case["client"], f"caseProof.items[{index}].client")
        _href(case["caseHref"], f"caseProof.items[{index}].caseHref")
        _text(case["summary"], f"caseProof.items[{index}].summary")
        _href(case["sourceHref"], f"caseProof.items[{index}].sourceHref")
        _text(case["sourceLabel"], f"caseProof.items[{index}].sourceLabel")
        _text(case["verifiedAt"], f"caseProof.items[{index}].verifiedAt")
    return source


def _render_case_proof(source: dict[str, Any], case: dict[str, str]) -> str:
    missing = REQUIRED_CASE_KEYS - set(case)
    if missing:
        raise ValueError(f"case proof is missing {', '.join(sorted(missing))}")
    client = _text(case["client"], "case.client")
    case_href = _href(case["caseHref"], "case.caseHref")
    summary = _text(case["summary"], "case.summary")
    source_href = _href(case["sourceHref"], "case.sourceHref")
    source_label = _text(case["sourceLabel"], "case.sourceLabel")
    verified_at = _text(case["verifiedAt"], "case.verifiedAt")
    labels = source["caseProof"]
    return (
        f"<aside class=\"homepage-case-proof\" aria-label=\"Public work: {html.escape(client, quote=True)}\">"
        f"<p class=\"homepage-case-proof__eyebrow\">{html.escape(labels['eyebrow'])}</p>"
        f"<h3><a data-reader-link href=\"{html.escape(case_href, quote=True)}\">{html.escape(client)}</a></h3>"
        f"<p>{html.escape(summary)}</p>"
        "<p class=\"homepage-case-proof__source\">"
        f"{html.escape(labels['sourcePrefix'])}: <a href=\"{html.escape(source_href, quote=True)}\" target=\"_blank\" rel=\"noopener noreferrer\">{html.escape(source_label)}</a>"
        f" <span aria-hidden=\"true\">·</span> <time datetime=\"{html.escape(verified_at, quote=True)}\">{html.escape(labels['checkedPrefix'])} {html.escape(verified_at)}</time>"
        "</p></aside>"
    )


def render_home_proof(source: dict[str, Any]) -> str:
    """Render the compact homepage row after the curated tile grid.

    It deliberately holds a small written process and two independently
    checkable client paths. It is not a new tile collection.
    """
    process = source["process"]
    labels = source["caseProof"]
    steps = "".join(
        "<li><span aria-hidden=\"true\">"
        f"{html.escape(step['number'])}</span><strong>{html.escape(step['title'])}</strong>"
        f"<p>{html.escape(step['body'])}</p></li>"
        for step in process["steps"]
    )
    cases = "".join(_render_case_proof(source, case) for case in labels["items"])
    return (
        "<section class=\"homepage-proof\" aria-labelledby=\"homepage-proof-title\">"
        "<div class=\"homepage-proof__inner\">"
        "<header class=\"homepage-proof__head\">"
        f"<p>{html.escape(process['eyebrow'])}</p>"
        f"<h2 id=\"homepage-proof-title\">{html.escape(process['heading'])}</h2>"
        f"<span>{html.escape(process['intro'])}</span>"
        "</header>"
        f"<ol class=\"homepage-proof__steps\">{steps}</ol>"
        f"<div class=\"homepage-proof__cases\"><div><p>{html.escape(labels['eyebrow'])}</p><h3>{html.escape(labels['heading'])}</h3></div>{cases}</div>"
        f"<a class=\"homepage-proof__action\" data-reader-link href=\"{html.escape(process['action']['href'], quote=True)}\">{html.escape(process['action']['label'])}</a>"
        "</div></section>"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", type=Path, required=True)
    args = parser.parse_args()
    source = load_homepage_proof(args.check)
    rendered = render_home_proof(source)
    if "Written scope and price" not in rendered or "homepage-proof" not in rendered:
        raise ValueError("homepage process did not render the required written-scope step")
    if "Chromatic Painting &amp; Design" not in rendered or "Hair By Rachel Charles" not in rendered:
        raise ValueError("homepage proof must render both named public case records")
    if "Google" in rendered:
        raise ValueError("homepage case proof must render named case evidence without a generic review claim")
    print("PASS homepage proof content contract")


if __name__ == "__main__":
    main()
