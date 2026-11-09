"""Extract the owner's selected artwork without generating replacement objects."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
RECEIPT = ROOT / '.lifi/design-source/sculpture/hero-reference.json'
record = json.loads(RECEIPT.read_text())
source = Path(record['source'])
assert hashlib.sha256(source.read_bytes()).hexdigest() == record['sourceSha256']
master = Image.open(source).convert('RGBA')
for output in record['outputs']:
    art = master.crop(output['crop'])
    alpha = art.getchannel('A')
    mask = ImageDraw.Draw(alpha)
    for region in output['transparentUiRegions']:
        mask.rectangle(region, fill=0)
    art.putalpha(alpha)
    target = ROOT / output['file']
    art.save(target, 'WEBP', lossless=True, exact=True, method=6)
    output['sha256'] = hashlib.sha256(target.read_bytes()).hexdigest()
RECEIPT.write_text(json.dumps(record, indent=2) + '\n')
print('Extracted the supplied desktop and mobile artwork with unchanged visible RGB.')
