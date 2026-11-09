from pathlib import Path
from PIL import Image
import json,math
base=Path(__file__).parent
root=base.parents[4]
r=json.loads((base/'composition-check.json').read_text()); bounds={t['id']:t for t in json.loads((base/'asset-bounds.json').read_text())}
resolved=[]
for issue in r['issues']:
    t=next(t for t in r['widths'][str(issue['width'])] if t['id']==issue['id']); b=bounds[t['id']]
    if 'overlap' not in issue['kind']:
        resolved.append({**issue,'requiresCorrection':True});continue
    im=Image.open(root/'app/public/assets/sculpture'/(b['art']+'.webp')).convert('RGBA'); a=im.getchannel('A')
    box=t['image']; factor=(max if t['fit']=='cover' else min)(box['width']/im.width,box['height']/im.height); dw=im.width*factor; dh=im.height*factor
    px,py=[float(v.rstrip('%'))/100 for v in t['position'].split()]
    dx=box['x']+(box['width']-dw)*px;dy=box['y']+(box['height']-dh)*py
    regions=[t['plus']] if issue['kind'].endswith('plus') else [v for v in t['text'] if v['text']==issue['text']]
    pixels=0
    for reg in regions:
        if t['fit']=='cover':
            x=max(reg['x'],box['x']);y=max(reg['y'],box['y'])
            reg={'x':x,'y':y,'width':max(0,min(reg['x']+reg['width'],box['x']+box['width'])-x),'height':max(0,min(reg['y']+reg['height'],box['y']+box['height'])-y)}
            if not reg['width'] or not reg['height']:continue
        area=(max(0,math.floor((reg['x']-dx)/factor)),max(0,math.floor((reg['y']-dy)/factor)),min(im.width,math.ceil((reg['x']+reg['width']-dx)/factor)),min(im.height,math.ceil((reg['y']+reg['height']-dy)/factor)))
        if area[2]>area[0] and area[3]>area[1]:pixels+=sum(a.crop(area).histogram()[129:])*factor*factor
    resolved.append({**issue,'opaqueIntersectionPixels':round(pixels,2),'requiresCorrection':pixels>4})
report={'evaluatedTileViews':sum(len(v) for v in r['widths'].values()),'boundingFlags':len(r['issues']),'flags':resolved,'remaining':[i for i in resolved if i['requiresCorrection']]}
(base/'composition-alpha-check.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
