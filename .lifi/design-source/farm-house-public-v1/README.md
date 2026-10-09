# Farm House public fixture v1

This is the reviewed, sanitized public Farm House exterior shell, renderer, model, and ordinary material textures. It is a reproducible input for `app/scripts/property-explorer/build.mjs`, not an archive of original project material.

The fixture lives outside `app/public` so it cannot be published as a second visitor surface. The build copies only this fixture's exterior shell, renderer, sanitized GLB, and material textures, then adds the Little Fight bootstrap, adapter, loader, poster, credits, and generated Inside files. `FARM_HOUSE_SOURCE` is intentionally not accepted: builds never reopen an upstream snapshot or protected private archive.

The build enforces these inputs before it writes output:

- `index.html`: `d47e645aaf6c46f34e9313e3160beceb5a1613e076d0e7865649e235645c811b`
- `farm-house-viewer.js`: `ce7fce1ea5cc4414043cec0e672dd0fec8c2be6fd986d8c71b45315a735125c0`
- `assets/farm-house.glb`: `8fabd0a509b643b172c2de14459262bd9d5dcf44c8fe4715e7d36f12a43c58ce`

Those public hashes are declared in `app/scripts/property-explorer/farm-house-public.json`. The manifest retains non-reversible historical source fingerprints only as redaction evidence. This fixture contains no address, geodata, source records, drawings, plans, private imagery, or upstream embed.
