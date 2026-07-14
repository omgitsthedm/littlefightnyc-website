#!/usr/bin/env python3
"""Generate PWA monochrome icons and stylized screenshots."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/Users/davidmarsh/Code/LiFi NYC/Clients/LittleFightNYC/Brand/Website/littlefightnyc-website")
OUT = ROOT / "app" / "public"

ORANGE = "#FE5800"
DARK = "#050507"
BONE = "#f4f2ed"


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def make_monochrome_icon(size):
    img = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(img)
    pad = size // 16
    radius = size // 8
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=255)

    # Draw "LF" in the center using a bold sans font if available, else fallback
    font_size = int(size * 0.5)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except Exception:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", font_size)
        except Exception:
            font = ImageFont.load_default()

    text = "LF"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2
    y = (size - th) // 2 - size // 32
    draw.text((x, y), text, font=font, fill=0)
    return img


def make_screenshot(width, height, title, subtitle, tagline, filename):
    img = Image.new("RGB", (width, height), DARK)
    draw = ImageDraw.Draw(img)

    # Top status bar-ish line
    draw.rectangle([0, 0, width, int(height * 0.04)], fill="#0d0f14")

    # Large brand mark / headline area
    try:
        headline_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(width * 0.06))
        sub_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(width * 0.035))
        small_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(width * 0.025))
    except Exception:
        headline_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Orange accent bar
    bar_height = max(6, height // 120)
    draw.rectangle([width // 8, height // 4, width * 7 // 8, height // 4 + bar_height], fill=ORANGE)

    # Title
    bbox = draw.textbbox((0, 0), title, font=headline_font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    y = height // 3
    draw.text((x, y), title, font=headline_font, fill=BONE)

    # Subtitle
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    y = height // 3 + int(width * 0.09)
    draw.text((x, y), subtitle, font=sub_font, fill="#b8b4a8")

    # Tagline / CTA band
    band_top = height * 3 // 4
    draw.rectangle([0, band_top, width, height], fill="#0d0f14")
    bbox = draw.textbbox((0, 0), tagline, font=small_font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    y = (band_top + height) // 2 - int(width * 0.012)
    draw.text((x, y), tagline, font=small_font, fill=BONE)

    # Small logo mark bottom corner
    mark_size = max(24, width // 20)
    draw.rounded_rectangle([width - mark_size - 24, height - mark_size - 24, width - 24, height - 24], radius=mark_size // 4, fill=ORANGE)
    try:
        lf_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(mark_size * 0.5))
    except Exception:
        lf_font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), "LF", font=lf_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((width - mark_size - 24 + (mark_size - tw) // 2, height - mark_size - 24 + (mark_size - th) // 2 - 2), "LF", font=lf_font, fill="black")

    img.save(OUT / filename, "PNG")
    print(f"Saved {filename}")


def main():
    # Monochrome icons
    for size in [192, 512]:
        icon = make_monochrome_icon(size)
        icon.save(OUT / f"icon-monochrome-{size}.png", "PNG")
        print(f"Saved icon-monochrome-{size}.png")

    # Monochrome SVG
    svg_path = OUT / "icon-monochrome.svg"
    svg_path.write_text(
        '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="22" fill="currentColor"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="black" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="44" letter-spacing="-2">LF</text>
</svg>'''
    )
    print("Saved icon-monochrome.svg")

    # Screenshots
    make_screenshot(390, 844, "Little Fight NYC", "Websites, IT Support, Better Systems", "Made for NYC small businesses", "screenshot-home-narrow.png")
    make_screenshot(390, 844, "Services", "Websites, Systems, IT Support", "See what we can fix first", "screenshot-services-narrow.png")
    make_screenshot(390, 844, "Tech Audit", "Get a fast first read", "Tell us what is broken or messy", "screenshot-audit-narrow.png")
    make_screenshot(1280, 720, "Little Fight NYC", "Manhattan small business tech help", "Websites, systems, IT support, and consulting", "screenshot-home-wide.png")
    make_screenshot(1280, 720, "Services", "Real help for owner-operated businesses", "Book a call or start a Tech Audit", "screenshot-services-wide.png")


def make_ios_splash(width, height, filename):
    img = Image.new("RGB", (width, height), DARK)
    draw = ImageDraw.Draw(img)

    # Center a large LF icon
    icon_size = min(width, height) // 4
    x0 = (width - icon_size) // 2
    y0 = (height - icon_size) // 2
    x1 = x0 + icon_size
    y1 = y0 + icon_size
    radius = icon_size // 5
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=ORANGE)

    try:
        font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(icon_size * 0.5))
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), "LF", font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x0 + (icon_size - tw) // 2, y0 + (icon_size - th) // 2 - height // 128), "LF", font=font, fill="black")

    # Bottom wordmark
    try:
        word_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", max(20, width // 28))
    except Exception:
        word_font = ImageFont.load_default()

    text = "Little Fight NYC"
    bbox = draw.textbbox((0, 0), text, font=word_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, height * 5 // 6), text, font=word_font, fill=BONE)

    img.save(OUT / filename, "PNG")
    print(f"Saved {filename}")


def main_splashes():
    splashes = [
        # iPhone portrait
        (1170, 2532, "apple-touch-startup-image-1170x2532.png"),
        (1290, 2796, "apple-touch-startup-image-1290x2796.png"),
        (750, 1334, "apple-touch-startup-image-750x1334.png"),
        # iPad portrait
        (1668, 2388, "apple-touch-startup-image-1668x2388.png"),
        (2048, 2732, "apple-touch-startup-image-2048x2732.png"),
        # iPad landscape (Home Screen app launch from landscape)
        (2732, 2048, "apple-touch-startup-image-2732x2048.png"),
        (2388, 1668, "apple-touch-startup-image-2388x1668.png"),
    ]
    for w, h, name in splashes:
        make_ios_splash(w, h, name)


if __name__ == "__main__":
    main()
    main_splashes()
