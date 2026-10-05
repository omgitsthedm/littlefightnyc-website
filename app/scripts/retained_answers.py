"""Build the public answer hub without hiding any existing answer routes.

The library is a map for a busy owner, not a chronological archive. Its links
are ordinary server-rendered anchors so a direct visitor, screen reader, and
search crawler receive the same complete collection.
"""

from __future__ import annotations

from collections.abc import Callable, Mapping
from html import escape
from typing import Any


Link = Callable[[str, str], str]


def _text(value: Any) -> str:
    return " ".join(str(value or "").split())


def _title(page: Mapping[str, Any]) -> str:
    answer = page.get("answerContent")
    if isinstance(answer, Mapping) and _text(answer.get("question")):
        return _text(answer["question"])
    for key in ("heading", "title", "description"):
        value = _text(page.get(key))
        if value:
            return value.split("|", 1)[0].strip()
    raise ValueError("answer hub route is missing public copy")


_GROUPS = (
    {
        "family": "web",
        "eyebrow": "Websites",
        "title": "Start or replace a website.",
        "summary": "Choose a path before you pay for one.",
        "paths": frozenset({
            "/answers/does-my-small-business-need-a-website-reddit/", "/answers/instagram-instead-of-a-website-nyc-shop/",
            "/answers/website-design-for-small-business-nyc/", "/answers/best-web-designer-nyc-reddit/",
            "/answers/best-web-design-agency-nyc-reddit/", "/answers/squarespace-vs-hiring-web-designer-reddit/",
            "/answers/wix-vs-custom-website-reddit/", "/journal/nyc-small-business-digital/",
            "/journal/webflow-vs-squarespace-manhattan-small-business/", "/journal/shopify-vs-squarespace-nyc-retail/",
            "/journal/wordpress-vs-webflow-vs-custom-nyc/",
        }),
    },
    {
        "family": "web",
        "eyebrow": "Websites",
        "title": "Make the site you have work harder.",
        "summary": "Fix the page, path, or handoff that is getting in the way.",
        "paths": frozenset({
            "/answers/website-form-not-working-small-business/", "/answers/website-down-emergency-nyc/",
            "/answers/web-developer-ghosted-me-reddit/", "/answers/local-pharmacy-website-community-support/",
            "/journal/migrate-off-squarespace-without-breaking-booking/", "/journal/spot-developer-about-to-ghost/",
            "/journal/your-website-is-your-hardest-working-employee/", "/journal/ada-website-lawsuits-nyc-small-business/",
            "/journal/how-to-stop-double-bookings-small-business/", "/journal/calendly-vs-square-appointments-nyc/",
        }),
    },
    {
        "family": "web",
        "eyebrow": "Customers",
        "title": "Help customers find and contact you.",
        "summary": "Make it easier to show up, make sense, and take the next step.",
        "paths": frozenset({
            "/answers/business-not-showing-on-google-maps/", "/answers/is-local-seo-worth-it-reddit/",
            "/answers/google-business-profile-tips-reddit/", "/answers/google-business-profile-suspended/",
            "/answers/google-reviews-not-showing-up/", "/journal/set-up-google-business-profile-nyc/",
            "/journal/how-to-answer-google-reviews-nyc-business/", "/journal/how-to-get-your-business-into-chatgpt-answers/",
            "/journal/ai-is-already-answering-questions-about-your-business/", "/journal/ai-google-broke-the-internet-websites-survive/",
            "/journal/what-google-looks-for-business-website/", "/journal/why-business-websites-will-be-invisible/",
            "/journal/why-chains-always-show-up-first-on-google/",
        }),
    },
    {
        "family": "consulting",
        "eyebrow": "Decisions",
        "title": "Understand scope, ownership, and costs.",
        "summary": "Know what you are buying, keeping, and responsible for.",
        "paths": frozenset({
            "/answers/reduce-monthly-software-costs-small-business/", "/answers/when-custom-business-system-beats-saas/",
            "/answers/airtable-vs-notion-vs-monday-small-business/", "/journal/read-your-monthly-software-bill/",
            "/journal/keep-connect-replace-build-framework/", "/journal/how-to-own-your-domain-name-not-your-web-guy/",
            "/journal/custom-business-system-vs-saas-subscriptions/", "/journal/what-a-free-tech-audit-actually-looks-like/",
        }),
    },
    {
        "family": "it",
        "eyebrow": "Tech support",
        "title": "Keep the business moving.",
        "summary": "Plain help for an interruption, a tool, or the tech behind the counter.",
        "paths": frozenset({
            "/answers/small-business-it-support-nyc-reddit-recommendations/", "/answers/how-to-find-good-it-guy-reddit/",
            "/answers/nyc-small-business-tech-help-reddit/", "/answers/it-consultants-for-small-business-nyc/",
            "/answers/computer-security-for-small-business-ny/", "/answers/business-email-going-to-spam/",
            "/answers/pos-system-down-restaurant-nyc/", "/journal/cybersecurity-for-small-business/",
            "/journal/how-do-i-back-up-my-business-data/", "/journal/what-to-do-when-business-wifi-keeps-dropping/",
            "/journal/signs-your-pos-is-about-to-fail/", "/journal/gmail-vs-google-workspace-small-business/",
            "/journal/why-small-business-tech-should-be-boring/",
        }),
    },
    {
        "family": "software",
        "eyebrow": "Systems",
        "title": "Choose or build a better system.",
        "summary": "Compare the tools, then decide what the business actually needs.",
        "paths": frozenset({
            "/answers/hair-salon-save-money-software/", "/answers/best-pos-system-small-business-reddit/",
            "/answers/square-vs-toast-reddit/", "/answers/glossgenius-vs-square-appointments-reddit/",
            "/answers/shopify-vs-squarespace-reddit/", "/answers/airtable-vs-notion-reddit-small-business/",
            "/journal/airtable-vs-notion-vs-monday-small-business/",
            "/journal/square-appointments-vs-glossgenius-nyc-salons/", "/journal/square-vs-toast-manhattan-restaurants/",
            "/journal/the-pen-and-paper-tax/", "/journal/questions-nyc-owners-actually-ask-us-about-ai/",
            "/journal/quickbooks-vs-wave-small-business-nyc/", "/journal/toast-vs-clover-nyc-bars/",
            "/journal/protecting-kids-from-ai/",
        }),
    },
)

# The homepage groups intentionally combine some small answer cards, but the
# library remains the permanent static index for every direct help URL.
_HELP_GROUPS = {
    "Start or replace a website.": frozenset({
        "/answers/help/website/", "/answers/help/platform/", "/answers/help/mobile/",
        "/answers/help/web-homepage-priority/", "/answers/help/web-redesign-decision/",
        "/answers/help/web-accessibility-basics/", "/answers/help/web-proof-before-pitch/",
        "/answers/help/web-content-collection/", "/answers/help/web-service-page/",
        "/answers/help/web-photos-with-purpose/", "/answers/help/web-events-calendar/",
        "/answers/help/web-ecommerce-inventory/", "/answers/help/web-multilingual-start/",
        "/answers/help/web-launch-checklist/",
    }),
    "Make the site you have work harder.": frozenset({
        "/answers/help/speed/", "/answers/help/booking/", "/answers/help/forms/",
        "/answers/help/care/", "/answers/help/web-site-health-check/",
    }),
    "Help customers find and contact you.": frozenset({
        "/answers/help/maps/", "/answers/help/web-local-facts/", "/answers/help/web-menu-and-hours/",
        "/answers/help/web-reviews-response/", "/answers/help/web-search-answer/",
        "/answers/help/web-newsletter-choice/",
    }),
    "Understand scope, ownership, and costs.": frozenset({
        "/answers/help/ownership/", "/answers/help/cost/", "/answers/help/web-hosting-ownership/",
        "/answers/help/web-domain-renewal/", "/answers/help/consulting-first-priority/",
        "/answers/help/consulting-tool-choice/", "/answers/help/consulting-unused-subscriptions/",
        "/answers/help/consulting-second-opinion/", "/answers/help/consulting-vendor-quote/",
        "/answers/help/consulting-provider-review/",
    }),
    "Keep the business moving.": frozenset({
        "/answers/help/wifi/", "/answers/help/email/", "/answers/help/onsite/",
        "/answers/help/printer/", "/answers/help/computer/", "/answers/help/human/",
        "/answers/help/backup/", "/answers/help/move/", "/answers/help/it-guest-network/",
        "/answers/help/it-internet-outage/", "/answers/help/it-shared-inbox-owner/",
        "/answers/help/it-account-handoff/", "/answers/help/it-password-ownership/",
        "/answers/help/it-license-renewal/", "/answers/help/it-video-call-room/",
        "/answers/help/it-storage-full/", "/answers/help/it-shared-files/",
        "/answers/help/it-phone-setup/", "/answers/help/it-software-updates/",
        "/answers/help/it-payment-device-check/", "/answers/help/it-new-hire-access/",
        "/answers/help/it-domain-email-renewal/", "/answers/help/it-support-notes/",
        "/answers/help/it-security-basics/", "/answers/help/it-permission-review/",
        "/answers/help/it-vendor-handoff/", "/answers/help/it-home-work-boundary/",
    }),
    "Choose or build a better system.": frozenset({
        "/answers/help/software/", "/answers/help/software-approval-path/",
        "/answers/help/software-repeat-work/", "/answers/help/software-duplicate-entry/",
        "/answers/help/software-connect-existing-tools/", "/answers/help/software-business-ownership/",
        "/answers/help/software-smallest-useful-change/", "/answers/help/software-handoff-notes/",
    }),
}


def _hub_routes(pages: Mapping[str, Any]) -> list[str]:
    return sorted(
        path for path, page in pages.items()
        if isinstance(page, Mapping)
        and (path.startswith("/answers/") or path.startswith("/journal/"))
    )


def _group_paths(paths: list[str]) -> list[tuple[Mapping[str, Any], list[str]]]:
    remaining = set(paths)
    grouped: list[tuple[Mapping[str, Any], list[str]]] = []
    for group in _GROUPS:
        group_paths = group["paths"] | _HELP_GROUPS.get(group["title"], frozenset())
        chosen = [path for path in paths if path in group_paths]
        if chosen:
            remaining.difference_update(chosen)
            grouped.append((group, chosen))
    if remaining:
        raise ValueError("answer hub has ungrouped routes: " + ", ".join(sorted(remaining)))
    return grouped


def _group_html(group: Mapping[str, Any], paths: list[str], pages: Mapping[str, Any], link: Link, *, open_group: bool) -> str:
    items = "".join("<li>" + link(_title(pages[path]), path) + "</li>" for path in paths)
    opened = " open" if open_group else ""
    return (
        f'<details class="answer-hub-group" data-answer-family="{escape(str(group["family"]))}"{opened}>'
        "<summary>"
        f'<span class="answer-hub-group__eyebrow">{escape(str(group["eyebrow"]))}</span>'
        f'<strong>{escape(str(group["title"]))}</strong>'
        f'<span class="answer-hub-group__summary">{escape(str(group["summary"]))}</span>'
        '<span class="answer-hub-group__plus" aria-hidden="true">+</span>'
        "</summary>"
        f'<ul class="answer-hub-links">{items}</ul>'
        "</details>"
    )


def render_retained_answers(
    _groups: object,
    _routes: object,
    pages: Mapping[str, Any],
    link: Link,
    _hidden_ids: object = (),
) -> str:
    """Return every retained answer and journal link in a useful visual map.

    Homepage tile consolidation must never decide what the public library keeps.
    The unused arguments remain for the compiler call site.
    """
    paths = _hub_routes(pages)
    answers = [path for path in paths if path.startswith("/answers/")]
    journals = [path for path in paths if path.startswith("/journal/")]
    if len(answers) != 101 or len(journals) != 37:
        raise ValueError(f"answer hub expected 101 answers and 37 journal notes, found {len(answers)} and {len(journals)}")
    groups = _group_paths(paths)
    # The map starts compact. All links remain in the document, but a visitor
    # sees six recognizable decisions instead of an undifferentiated link wall.
    rendered = "".join(
        _group_html(group, entries, pages, link, open_group=False)
        for group, entries in groups
    )
    return (
        '<section class="answer-hub" aria-label="Questions by topic">'
        f'<div class="answer-hub-groups">{rendered}</div>'
        '</section>'
    )
