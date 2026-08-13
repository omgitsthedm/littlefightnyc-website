# VERA Atlas vendor provenance

Captured 2026-08-13 from the public OpenFreeMap project and asset service.
This directory intentionally vendors the complete three-family glyph set so
the bounded Atlas does not lose labels when source data contains non-Latin
text. Vector and Natural Earth tiles remain live OpenFreeMap requests.

## Pinned style and sprites

- Repository: https://github.com/hyperknot/openfreemap-styles
- Revision: `72e1480dfc92858d334647037988bd2591fdb021`
- Revision page: https://github.com/hyperknot/openfreemap-styles/commit/72e1480dfc92858d334647037988bd2591fdb021
- Style source: `styles/liberty/style.json`
- Sprite source: `sprites/sprites/ofm_f384/`

`liberty-local.json` is byte-equivalent as parsed JSON to that pinned style
after four URL localizations: the two OpenFreeMap tile placeholders resolve to
`tiles.openfreemap.org`, and the sprite/glyph templates resolve to VERA's
first-party vendor directory. No visual layer values are changed.

SHA-256:

- `liberty-local.json`: `c3b181be9436e3e2eb80668382768644a8b14ec90fa1d158317d5dc6cb0f06ec`
- `sprite/ofm.json`: `73e75e58d8c7bb62cc25d9d150660500552f4d04f6eac5efa4e236076773c356`
- `sprite/ofm.png`: `8996a519d218dc5f98015267709dae272a77bb74ef0ecc5a0992dcf276c1be4c`
- `sprite/ofm@2x.json`: `82a4aaeed2c5ce6e98553915754dbe394ee66fd9a2aacc4318d25cdd74e8730b`
- `sprite/ofm@2x.png`: `3793faf7dc47960636e4b6b1039978fa6925e6c90a7cb49ef23b37e153635c9b`

## Glyph snapshot

- Source template: `https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf`
- Families: Noto Sans Regular, Noto Sans Bold, Noto Sans Italic
- Coverage: all 256-codepoint ranges from `0-255` through `65280-65535`
- Files: 768 PBFs
- Bytes: 104,594,877
- SHA-256 of the sorted per-file SHA-256 manifest: `02f4cb94608d049fae80f6de53511836b4ce79e7540b75be4ad1b1b44c95a986`

Licensing and attribution are retained in `LICENSE-OPENFREEMAP.md` and
`LICENSE-NOTO.txt`. Runtime attribution remains visible in Atlas.
