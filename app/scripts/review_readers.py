"""Source-faithful local reader records for the verified Google review cards."""
from html import escape
from re import fullmatch

E = lambda value: escape(str(value or ""), quote=True)


def review_path(review_id):
    """Return the one canonical local route for an authenticated source record."""
    review_id = str(review_id or "")
    if not fullmatch(r"google-review-[1-9][0-9]*", review_id):
        raise ValueError(f"Invalid Google review id: {review_id!r}")
    return f"/reviews/{review_id}/"


def review_reader_pages(reviews, family_by_id):
    """Derive the seven reader records solely from the verified review source."""
    records = reviews.get("reviews") if isinstance(reviews, dict) else None
    if not isinstance(records, list) or len(records) != 7:
        raise ValueError("Review readers require the seven verified Google records")
    expected = {f"google-review-{number}" for number in range(1, 8)}
    actual = {str(record.get("id") or "") for record in records if isinstance(record, dict)}
    if actual != expected or len(actual) != len(records):
        raise ValueError("Review reader identities must exactly match the verified review records")

    pages = {}
    for record in records:
        review_id = record["id"]
        family = family_by_id.get(review_id)
        if family not in {"web", "it", "consulting", "software"}:
            raise ValueError(f"Review {review_id} needs its retained homepage family")
        if record.get("rating") != 5 or not record.get("displayName") or not record.get("sourceUrl"):
            raise ValueError(f"Review {review_id} is missing verified source fields")
        excerpt = record.get("excerpt")
        if excerpt is not None and not isinstance(excerpt, str):
            raise ValueError(f"Review {review_id} excerpt must remain source text or null")
        path = review_path(review_id)
        pages[path] = {
            "path": path,
            "id": review_id,
            "title": f"Google review from {record['displayName']} | Little Fight NYC",
            "heading": f"Google review from {record['displayName']}",
            "summary": "A verified Google review excerpt, shown with its original source link.",
            "description": f"Google review from {record['displayName']} with a direct link to the original source.",
            "family": family,
            "sections": [],
            # Kept as a source record for the builder; never emitted as Review
            # or AggregateRating structured data.
            "_reviewReader": {**record, "family": family},
        }
    return pages


def render_review_reader(record):
    """Render the concise source record: quote, attribution, source, next step."""
    if not isinstance(record, dict) or record.get("rating") != 5:
        raise ValueError("Review reader requires a verified five-star source record")
    name = E(record.get("displayName"))
    source = E(record.get("sourceUrl"))
    excerpt = record.get("excerpt")
    quote = f"<blockquote>“{E(excerpt)}”</blockquote>" if excerpt else "<p class=\"review-reader-rating-only\">Five stars.</p>"
    quote_class = " review-reader-quote--long" if len(str(excerpt or "")) > 40 else ""
    title = f"Google review from {name}"
    family_actions = {
        "web": ("/services/custom-local-websites/", "Talk about your website +"),
        "it": ("/services/it-support/", "Get tech support +"),
        "consulting": ("/services/tech-consulting/", "Get a second opinion +"),
        "software": ("/services/business-systems/", "Talk about your tools +"),
    }
    action_path, action_label = family_actions.get(record.get("family"), ("/examples/", "See Little Fight work +"))
    return (
        '<section class="review-reader" data-review-reader="true" '
        f'data-review-id="{E(record.get("id"))}" data-review-source-url="{source}">'
        f'<h1 class="sr-only" id="detail-title" tabindex="-1">{title}</h1>'
        '<p class="review-reader-kicker">Google review</p>'
        f'<div class="review-reader-stars" role="img" aria-label="{E(record.get("rating"))} out of 5 stars">★★★★★</div>'
        f'<div class="review-reader-quote{quote_class}">{quote}</div>'
        f'<p class="review-reader-attribution">{name}</p>'
        f'<p class="review-reader-source"><a href="{source}" target="_blank" rel="noopener noreferrer">Read the original on Google +</a></p>'
        '<nav class="review-reader-next" aria-label="Continue exploring">'
        f'<a data-reader-link href="{action_path}">{action_label}</a>'
        '<a data-reader-link href="/reviews/">More client reviews +</a>'
        '</nav></section>'
    )
