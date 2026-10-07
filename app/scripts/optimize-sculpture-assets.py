"""Responsive delivery sizes; original artwork and screen composites stay intact."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import re
import sys

ROOT=Path(__file__).resolve().parents[2]
ASSETS=ROOT/'app/public/assets/sculpture'
receipt=ROOT/'.lifi/design-source/sculpture/delivery.json'
selected=set(sys.argv[1:])
manifest=json.loads(receipt.read_text()) if selected and receipt.is_file() else {}
for source in sorted(ASSETS.glob('*.webp')):
    if re.search(r'-(480|800)$',source.stem):continue
    if selected and source.stem not in selected:continue
    original=Image.open(source)
    variants=[]
    for width in [480,800]:
        if width>=original.width:continue
        target=source.with_stem(source.stem+'-'+str(width))
        # Publish a complete rendition atomically; a preview build must never
        # copy a partially encoded WebP while artwork is being prepared.
        pending=receipt.parent/(target.name+'.pending')
        original.resize((width,round(original.height*width/original.width)),Image.Resampling.LANCZOS).save(pending,'WEBP',quality=88,method=6)
        pending.replace(target)
        if target.stat().st_size<source.stat().st_size:
            variants.append({'file':target.name,'width':width,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    variants.append({'file':source.name,'width':original.width,'bytes':source.stat().st_size,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
    manifest[source.stem]=variants
receipt.write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Responsive delivery for {len(manifest)} sculpture assets; full originals preserved.')
