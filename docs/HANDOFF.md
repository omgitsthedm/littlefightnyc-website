# Little Fight NYC — Developer Handoff

## Project Overview

Little Fight NYC is now positioned around right-sized websites, tools, local visibility, and business systems for New York businesses. On-demand support remains part of the offer, but it is no longer the headline identity.

The live site is a multi-page static HTML/CSS/JS website deployed to Netlify. The current conversion path centers on `/fit-check/`, plus a short Twilio-compatible Fit Check voice intake at `/api/fit-check/voice`.

For the newest operational handoff, use `CLAUDE.md` in the repo root first. This document is older project context and should be treated as secondary.

---

## Project Locations

| What | Path / URL |
|------|-----------|
| Local repo | `~/Desktop/LiFi NYC/Brand/Website/littlefightnyc-website` |
| GitHub | `https://github.com/omgitsthedm/littlefightnyc-website.git` |
| Live site | `https://littlefightnyc.com` |
| Netlify site ID | `0907d8fe-7018-48db-a6be-1f906e4b2619` |
| Netlify project name | `littlefightnyc` |
| Branch | `main` |
| Current handoff | `CLAUDE.md` |
| Audit app local sync | `tmp/audits-sync/` |
| Dev server | `python3 -m http.server 8090` from repo root |

---

## Site Architecture

### Homepage (`/index.html`)

The homepage now leads with the right-sized systems positioning, the Keep / Connect / Replace / Build framework, the Fit Check offer, software guides, and the routing-to-revenue model.

The old hash-route homepage notes are no longer current. The acquisition paths now live as crawlable page routes such as `/fit-check/`, `/business-systems/`, `/websites/`, `/local-search/`, `/software-guides/`, `/services/`, and `/solutions/`.

### Standalone Pages (directory-based pretty URLs)

Each has its own `index.html` and shared CSS/JS assets.

**Service pages (`/services/`):**

| URL | Page |
|-----|------|
| `/services/` | Services index |
| `/services/website-design-small-business-nyc/` | Website Design |
| `/services/on-site-it-support-nyc/` | On-Site IT Support |
| `/services/local-seo-and-google-ads-nyc/` | SEO & Google Ads |
| `/services/apple-device-setup-and-management/` | Apple Device Setup |
| `/services/branding-and-identity-design/` | Branding & Identity |
| `/services/ecommerce-setup-shopify-square-woocommerce/` | E-Commerce Setup |
| `/services/pos-and-register-setup-nyc/` | POS & Register Setup |
| `/services/smart-home-services-nyc/` | Redirects to `/business-systems/` |
| `/services/tech-consulting-small-business/` | Tech Consulting |

**Blog posts (mixed formats):**

| URL | Post |
|-----|------|
| `/blog/` | Blog index |
| `/blog/cybersecurity-for-small-business.html` | Cybersecurity article |
| `/blog/nyc-small-business-digital.html` | NYC digital article |
| `/blog/protecting-kids-from-ai.html` | AI safety article |
| `/ai-google-broke-the-internet-websites-survive/` | AI & Google article |
| `/what-google-looks-for-business-website/` | Google ranking article |
| `/why-business-websites-will-be-invisible/` | Website visibility article |

**Area/neighborhood pages (`/areas/`):**

| URL | Neighborhood |
|-----|-------------|
| `/areas/east-village.html` | East Village |
| `/areas/lower-east-side.html` | Lower East Side |
| `/areas/meatpacking-district.html` | Meatpacking District |
| `/areas/midtown.html` | Midtown |
| `/areas/soho.html` | SoHo |
| `/areas/upper-east-side.html` | Upper East Side |
| `/areas/west-village.html` | West Village |

**Other standalone pages:**

| URL | Page |
|-----|------|
| `/about/` | About |
| `/contact/` | Contact |
| `/work/` | Portfolio |
| `/solutions/` | Solutions |
| `/industries.html` | Industries |
| `/privacy.html` | Privacy Policy |
| `/terms.html` | Terms of Service |
| `/404.html` | Custom 404 |
| `/insights/` | Redirects to `/blog/` via netlify.toml |

---

## Key Files

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Homepage — CSS, HTML, JS all inline | ~3900 lines |
| `js/hero-3d.js` | 3D Three.js hero animation (ES module) | ~680 lines |
| `netlify.toml` | Headers, redirects, CSP, cache rules | ~170 lines |
| `sitemap.xml` | XML sitemap for all pages | — |
| `robots.txt` | Crawler rules | — |
| `site.webmanifest` | PWA manifest | — |

### Assets

| Directory | Contents |
|-----------|----------|
| `assets/` | Preview images (afterhours, bside, grandfunding WebPs) |
| `assets/pill-scroll/` | 16 WebP photos (legacy hero, no longer used) |
| `fonts/` | Lexend (variable woff2), Caveat 700 (woff2) |
| `vendor/` | GSAP + ScrollTrigger (legacy, may not be active) |
| `images/` | Misc images |
| `css/` | External CSS (if any — most CSS is inline) |
| `js/` | `hero-3d.js` (3D hero module) |

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#080b14` | Page background, scene fog, theme-color meta |
| Surface | `#0d1120` | Card backgrounds, sections |
| Brand orange | `#FE5800` | CTAs, neon sign, highlights, primary accent |
| Ocean blue | `#0891B2` | Secondary accent, grid lines, some buildings |
| Text primary | `#f0f0ec` | Headings, body text |
| Text muted | `#8a8ea0` | Secondary text, descriptions |
| Heading font | Lexend 800 | All headings |
| Body font | Lexend 400 | Body copy |
| Handwritten font | Caveat 700 | Accent lines ("First hour free!", taglines) |
| Browser chrome | `#080b14` | `<meta name="theme-color">` |

---

## 3D Hero — `js/hero-3d.js`

### How It Loads

1. `index.html` has an import map at line 44 mapping `three` → cdnjs CDN and `three/addons/` → unpkg CDN
2. `<canvas id="hero-3d-canvas">` inside `.hero-visual.hero-3d-container` at line 795
3. `.canvas-overlay` div covers canvas (solid `#080b14`) until animation starts
4. `<script type="module">` at bottom of body imports `init` from `./js/hero-3d.js` and calls `init(container)`
5. On first `requestAnimationFrame`, overlay gets `.revealed` class (CSS transition fades it out)

### Scene Composition

**Buildings (15 total, 3 rows):**

| Row | Buildings | Z range | Heights |
|-----|-----------|---------|---------|
| Front | 5 (indices 0–4) | z: 0.8–1.2 | 2.0–3.0 |
| Main | 6 (indices 5–10) | z: -0.6–-0.2 | 2.4–5.2 |
| Back | 4 (indices 11–14) | z: -2.8–-2.2 | 4.0–5.5 |

Hero building (index 8): tallest at 5.2, purple `#8B5CF6`, has LI FI neon sign + antenna.

**Building colors:**

| Color | Hex | Buildings |
|-------|-----|-----------|
| Red/coral | `#FF6B6B` | 0 |
| Brand orange | `#FE5800` | 1, 5 |
| Green | `#06D6A0`, `#10B981` | 2, 4, 14 |
| Yellow | `#FFBE0B` | 3 |
| Orange-red | `#FF6B35` | 6 |
| Ocean blue | `#0891B2` | 7, 10, 12 |
| Purple | `#8B5CF6` | 8 (hero), 11 |
| Pink | `#E040A0` | 9, 13 |

**Per-building features:**

| Feature | Details |
|---------|---------|
| Windows | Grid on all 4 faces (0.09w x 0.13h boxes), spacing 0.17h x 0.22v, 5 material types |
| Door | Framed entrance (dark wood) + glass panel (warm emissive) + brass handle, front face |
| Storefronts | Display windows flanking doors on front-row buildings (z > 0.3, w >= 0.9) |
| Awnings | Colored canopies with hanging valance on storefront buildings |
| Wireframe | Subtle colored edge lines (40% opacity) |

**Window material distribution:**

| Type | Color | Probability |
|------|-------|-------------|
| Dark (off) | `#0a0a18` | 22% |
| Warm yellow | `#FFDD44` | 30% |
| Cool white | `#CCDDFF` | 20% |
| Warm orange | `#FFAA55` | 16% |
| TV blue | `#6688FF` | 12% |

~7% of lit windows are marked as "flicker windows" with random speed (1.5–5.5 Hz) and phase.

**Rooftop features:**

| Feature | Buildings | Details |
|---------|-----------|---------|
| Water towers | 7, 11, 12 | Barrel on 4 stilts, 2 metal bands, conical roof |
| AC units | 0, 3, 5, 9, 10, 14 | 2 per building, box + fan grill |
| Satellite dishes | 2, 6, 13 | Hemisphere, random orientation |
| Chimneys | 1, 4, 6, 10 | Small box stacks |
| Antenna + blink | 8 (hero) | Spire + red blinking sphere |
| Neon sign | 8 (hero) | "LI FI" — 7 box bars, interactive hover glow |

**Ground level:**

| Element | Details |
|---------|---------|
| Ground plane | 40x40, dark metallic (`#0c0e18`, roughness 0.15, metalness 0.85) |
| Grid | Cyan `#0891B2` wireframe, 12% opacity |
| Road | 14x2.4 asphalt strip at z=3.5 |
| Yellow center line | 12-unit long, emissive `#FFCC00` |
| White dashed lines | Edge lines at z=3.5 ± 1.05 |
| Crosswalk | 6 white stripes at center |
| Sidewalk | 14x0.7 strip at z=2.05 |
| Street lamps | 3 posts at x=[-3.5, 0, 3.5] with arm, hood, warm glow bulb + point light |

**Sky:**

| Element | Details |
|---------|---------|
| Sky dome | 50-radius sphere with gradient shader (dark → darker) |
| Stars | 80 (mobile) / 220 (desktop) point particles in upper hemisphere |
| Moon | Sphere at (12, 18, -15), subtle blue-white emissive |

### Camera

| Platform | FOV | Position | LookAt | Scroll behavior |
|----------|-----|----------|--------|----------------|
| Desktop | 38° | (0, 3, 12) | (0, 2.2, 0) | z shrinks by 2, y rises by 1 |
| Mobile | 45° | (0, 3, 13) | (0, 2.2, 0) | Same parallax |

### Lighting

| Light | Type | Color | Intensity | Position |
|-------|------|-------|-----------|----------|
| Ambient | AmbientLight | `#182040` | 0.6 | — |
| Moon | DirectionalLight | `#4466aa` | 0.4 | (8, 15, 10) |
| Street warm L | PointLight | `#FFAA60` | 1.4 | (-2, 1.5, 4) |
| Street warm R | PointLight | `#FFAA60` | 1.4 | (2, 1.5, 4) |
| Street warm far L | PointLight | `#FF8844` | 0.7 | (-4, 2.5, 2) |
| Street warm far R | PointLight | `#FF8844` | 0.7 | (4, 2.5, 2) |
| Cool overhead | PointLight | `#5533CC` | 0.4 | (0, 5, 3) |
| 3 lamp posts | PointLight | `#FFDD88` | 0.5 each | x=[-3.5, 0, 3.5], y=2.3 |
| Neon sign | PointLight | `#FE5800` | 5 (after rise) | On sign + scene level |

### Animation Timeline

| Time | Event |
|------|-------|
| 0.0s | Buildings start below ground (y = -(h+2)), begin rising with `easeOutBack` |
| 0.0–0.8s | Grid fades in to 12% opacity |
| 0.4s | Neon "LI FI" letters light up (emissive ramps to 3.5) |
| 0.5s | Windows + storefronts light up (emissive ramps to targets) |
| 0.8s | Rise complete → steady state begins |

**Steady state (after 0.8s):**

| Animation | Details |
|-----------|---------|
| Building glow | Each building has unique sine rhythm (0.3–0.8 Hz, random phase), emissive oscillates 0.12–0.22 — smooth, not fire-like |
| Window flicker | ~7% of lit windows vary emissive 1.4–2.6 at individual random speeds |
| Neon hover | Pointer hover over sign → emissive jumps from 2.2 to 3.5 |
| Antenna blink | Red sphere toggles 0.3 ↔ 3.0 emissive on sin threshold |
| Storefront pulse | Door glass: 2.0–2.4 at 0.6 Hz; Display windows: 2.55–3.05 at 0.4 Hz |
| Auto-rotate | 0.3 speed, starts immediately (critical for mobile) |
| Scroll parallax | Camera pulls back 2 units on z, rises 1 unit on y over first 500px scroll |
| Scroll fade | Canvas opacity fades to 0 between 70–100% scroll progress |

### Mobile Adaptations

| Setting | Desktop | Mobile |
|---------|---------|--------|
| FOV | 38° | 45° |
| Camera Z | 12 | 13 |
| Bloom | UnrealBloomPass (0.7, 0.5, 0.4) | Disabled |
| Pixel ratio | min(devicePixelRatio, 2) | min(devicePixelRatio, 1.5) |
| Antialias | Enabled | Disabled |
| Stars | 220 | 80 |
| Rotate | Click-drag enabled | Disabled, touch-action: pan-y |
| Auto-rotate | On (after rise) | On (immediately) |
| Hero min-height | 400px (default) | 300px (768), 260px (480) |

### Neon Sign Interaction

- Raycaster checks pointer position against invisible hitbox around sign
- On hover: neon bar emissive targets 3.5 (lerps at 0.05 rate)
- Off hover: targets 2.2
- Desktop only (pointermove event)

---

## Responsive Breakpoints

| Breakpoint | Layout changes |
|------------|---------------|
| > 960px | 2-column hero grid (1fr 1fr), multi-column grids |
| 768–960px | Hero grid 1fr 0.8fr, service/promise/why grids 2-col |
| < 768px | Single column, hero visual on top (order: -1), nav hidden → mobile drawer (260px slide-in) |
| < 640px | All grids single column, work carousel stacks vertical |
| < 480px | Reduced padding, stats 2x2 grid, smaller headings |
| < 375px | Buttons stack full-width |

**Mobile-specific UI:**
- Sticky bottom bar: "Call Now" phone link + "Get Help →" CTA
- Glass morphism nav with gradient shimmer
- Mobile drawer: 260px wide slide-in menu
- Safe area insets for notched devices

---

## SEO & Schema

**Schema.org JSON-LD (in index.html `<head>`):**
- `LocalBusiness` — company info, address, phone, hours
- `WebSite` — site-level with SearchAction
- `WebPage` — homepage
- `FAQPage` — homepage FAQ section
- 6x `Article` — one per blog post
- 6x `FAQPage` — one per blog post

**Meta tags:**
- `<meta name="theme-color" content="#080b14">` — browser chrome tint
- Open Graph tags for social sharing
- Canonical URLs on all pages

---

## Netlify Configuration (`netlify.toml`)

### Headers

| Path | Header | Value |
|------|--------|-------|
| `/*` | Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://challenges.cloudflare.com; ...` |
| `/*` | X-Frame-Options | DENY |
| `/*` | Referrer-Policy | strict-origin-when-cross-origin |
| `/css/*` | Cache-Control | `public, max-age=31536000, immutable` |
| `/js/*` | Cache-Control | `public, max-age=3600, must-revalidate` |
| `/fonts/*` | Cache-Control | `public, max-age=31536000, immutable` |
| `/images/*` | Cache-Control | `public, max-age=31536000, immutable` |

**Note:** JS cache was changed from 1-year immutable to 1-hour revalidate because `hero-3d.js` changes frequently and has no filename hash.

### Redirects

- 9 service page redirects (old URLs → `/services/` subdirectory, 301)
- `/insights` and `/insights/` → `/blog/` (301, force)
- 3 blog `.html` → extensionless redirects (301, force)
- `/industries.html` → `/industries` (301, force)
- `/*` → `/404.html` (404 fallback)
- Static file pass-throughs for sitemap.xml, robots.txt, site.webmanifest

---

## Homepage Features

### NYC Map Canvas

- Real lat/lng Manhattan shoreline (~70 coordinate points)
- `geoToCanvas()` projection function
- Central Park outline, Broadway line, river labels
- Animated neighborhood dots with hover interaction

### Social Proof Ticker

- Horizontal scrolling marquee of client names
- "TRUSTED BY NYC BUSINESSES:" header

### Trust Badges

- 5+ Years Serving NYC
- 4.9 Google Rating
- 2hr Avg Response
- 100% Satisfaction Rate

### Work Carousel

5 real client cards:
- After Hours Agenda (Nightlife)
- B-Side NYC (Nightlife)
- Grand Funding (Finance) — uses screenshot fallback (`grandfunding-preview.webp`) because their site blocks iframes
- Logan Loans (Finance)
- CC Films (Film)

---

## Contact Info

| Field | Value |
|-------|-------|
| Email | hello@littlefightnyc.com |
| Phone | (646) 360-0318 |
| Location | Manhattan, NYC |
| Audit site | audits.littlefightnyc.com |

---

## Recent Changes (this session)

| Commit | Description |
|--------|-------------|
| `a5a29b9` | Fix JS cache headers: 1yr immutable → 1hr revalidate |
| `3701286` | Premium 3D hero overhaul: windows, doors, streets, sky, mobile fix |
| `c7916af` | Fix Object.assign crash on Three.js Mesh read-only position |
| `3eee2d7` | Pull camera back for full skyline framing |
| `001ca63` | Vibrant buildings, remove particles, individual glow rhythms |

---

## What NOT to Change

- `netlify.toml` redirect rules for old service page URLs
- `404.html`, `privacy.html`, `terms.html`, `industries.html` — standalone pages, don't touch
- Favicon files in root — new ones override via `<link>` tags
- Schema.org JSON-LD blocks — carefully validated for E-E-A-T
- The `source-698153f9b2302cb688f2a546-dec6888c042d2110/` directory — appears to be an old source/backup, don't modify
- `.superpowers/` directory — brainstorm artifacts from previous sessions

---

## Deploy Process

```bash
# From repo root
cd ~/Desktop/littlefightnyc-website

# Local dev server
python3 -m http.server 8090

# Deploy to production (direct, no build step)
netlify deploy --prod --dir=.

# Push to GitHub (triggers Netlify auto-deploy too)
git push origin main
```

Netlify CLI must be linked to the correct project:
```bash
netlify link --id 0907d8fe-7018-48db-a6be-1f906e4b2619
netlify status  # verify it says "littlefightnyc", NOT "afterhoursagenda"
```
