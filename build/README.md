# build/ — HTML partial injector

Single-sources the sitewide **nav**, **footer**, and **GA4 snippet** so editing
one of them no longer means editing ~100 HTML files by hand.

## How it works

The canonical markup for each shared block lives in `partials/`:

| Block     | Partial file            | Marker pair                                              |
|-----------|-------------------------|---------------------------------------------------------|
| nav       | `partials/nav.html`     | `<!-- @include:nav start -->` … `<!-- @include:nav end -->` |
| footer    | `partials/footer.html`  | `<!-- @include:footer start -->` … `<!-- @include:footer end -->` |
| analytics | `partials/analytics.html` | `<!-- @include:analytics start -->` … `<!-- @include:analytics end -->` |

`build/inject-partials.mjs` walks every `*.html` page (skipping `.git`,
`node_modules`, `partials/`, `build/`) and, for each block:

1. If the page already has the marker pair, it re-writes the marked region to
   match the current partial. **This is the edit workflow:** change a partial,
   run the build, every marked page updates.
2. If the page has no markers yet, it locates the raw block. It only wraps the
   block in markers when that block is **byte-identical to the partial**
   (ignoring leading/trailing whitespace). A block that differs is **left
   untouched** and printed as `SKIP`.

The markers are HTML comments, so rendered output is unchanged. The script is
**output-preserving** (it never alters a block whose content differs from the
canonical partial) and **idempotent** (running it twice produces no diff).

## Usage

```bash
npm run build:html            # inject / re-source partials (writes files)
node build/inject-partials.mjs --check   # dry run: report only, no writes
```

## To edit the nav / footer / GA4 sitewide

1. Edit the relevant file in `partials/`.
2. Run `npm run build:html`.
3. Review `git diff`, then ship through the normal preview → promote flow.

## Intentionally NOT migrated

These pages keep their own version of a block because it genuinely differs from
canonical (different links/copy per section). The injector skips them by design —
correctness over coverage. Re-run with `--check` to see the current list.

- **nav (7 skipped):** `index.html` (JS SPA whose nav drives `navigateTo()` /
  `page-section` / `toggleDrawer` — must not be touched), plus
  `consulting/`, `fires/`, `it-support/`, `systems/`, `websites/`, `ask/`
  index pages, which carry section-specific nav variants.
- **footer (53 skipped):** pages with section-specific footer copy/links —
  e.g. all `answers/*`, several `areas/*`, the `vs-*` comparison pages, and
  others. They use different contact copy or link lists than the canonical
  footer.
- **assets/shaders/chromatic-bloom.html** has no site nav/footer/GA4 at all.

If you want one of these consolidated later, first make its block match the
canonical partial, then re-run the build.
