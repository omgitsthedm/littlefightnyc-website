"""Place unmodified public captures into the rendered screen apertures.

Perspective and contain-fit only. The original files are read, never rewritten.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageChops
import numpy as np
import json, hashlib, os, sys
from urllib.parse import urlsplit
from approved_screens import approved_originals, require_approved, selected_originals

APP=Path(__file__).resolve().parents[1]
PUBLIC=APP/'public'; OUT=PUBLIC/'assets/sculpture'
FRAMES=APP.parent/'.lifi/evidence/visual-overhaul/frames'
ONLY=set(sys.argv[1:])
RECEIPTS=APP.parent/'.lifi/design-source/sculpture/screen-composites.json'
receipts=json.loads(RECEIPTS.read_text()) if ONLY and RECEIPTS.exists() else []
# Sources come only from the reviewed, owner-authorized replacement library.
# The unavailable original 224-image gallery is never claimed as recovered.
approved=approved_originals()
selected=selected_originals()

def locate(url):
    relative=urlsplit(str(url)).path.lstrip('/')
    for base in [PUBLIC,APP/'preview-ui',APP/'preview-ui/assets',APP/'dist']:
        path=base/relative
        if path.is_file():return path
    raise FileNotFoundError(url)

def composite(name,source,frame='browser',crop=None):
    if ONLY and name not in ONLY:return
    if frame != 'photo': source=require_approved(source,approved)
    receipts[:]=[r for r in receipts if r['name']!=name]
    original=Image.open(source).convert('RGBA')
    if crop:original=original.crop(crop)
    template=Image.open(FRAMES/(frame+'.png')).convert('RGBA')
    meta=json.loads((FRAMES/(frame+'.json')).read_text())
    target=meta['quad'];w,h=(1000,2182) if frame=='phone' else (834,1194) if frame=='tablet' else (1400,911)
    capture=ImageOps.pad(original,(w,h),method=Image.Resampling.LANCZOS,color=(8,9,11,255),centering=(.5,0))
    src=[(0,0),(w,0),(w,h),(0,h)];matrix=[];vector=[]
    for (x,y),(u,v) in zip(target,src):
        matrix.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);vector.extend([u,v])
    coeff=np.linalg.solve(np.array(matrix),np.array(vector))
    warped=capture.transform(template.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
    aperture=Image.new('L',template.size,0)
    ImageDraw.Draw(aperture).polygon([tuple(point) for point in target],fill=255)
    warped.putalpha(ImageChops.multiply(warped.getchannel('A'),aperture))
    template=Image.alpha_composite(template,warped)
    box=template.getbbox();template=template.crop((max(0,box[0]-24),max(0,box[1]-24),min(template.width,box[2]+24),min(template.height,box[3]+24)))
    template.save(OUT/(name+'.webp'),'WEBP',quality=88,method=6)
    receipts.append({'name':name,'source':os.path.relpath(source,APP),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':crop,'frame':frame,'screenQuadrilateral':target,'outputSize':template.size,'outputSha256':hashlib.sha256((OUT/(name+'.webp')).read_bytes()).hexdigest(),'method':'Real captured pixels, optional documented viewport crop, contain fit and deterministic perspective projection; original file preserved.'})

cases=json.loads((APP/'preview-content/cases.json').read_text())
visuals=json.loads((APP/'preview-content/case-visuals.json').read_text())['cases']
for case in cases:
    source=selected[case['slug']+'-desktop']
    composite('browser-'+case['slug'],source['path'],crop=source.get('crop'))
composite('phone-chromatic',selected['chromatic-painting-design-phone']['path'],'phone')
composite('browser-rachel-services',selected['rachel-services-desktop']['path'])
composite('tablet-chromatic',selected['chromatic-painting-design-tablet']['path'],'tablet')
foldable_source=selected['chromatic-painting-design-foldable']['path']
if not ONLY or 'foldable-chromatic' in ONLY:
    foldable_source=require_approved(foldable_source,approved)
    receipts[:]=[r for r in receipts if r['name']!='foldable-chromatic']
    original=Image.open(foldable_source).convert('RGBA')
    capture=ImageOps.pad(original,(1600,1600),method=Image.Resampling.LANCZOS,color=(8,9,11,255),centering=(.5,0))
    template=Image.open(FRAMES/'foldable.png').convert('RGBA')
    quads=json.loads((FRAMES/'foldable.json').read_text())['quads']
    for index,target in enumerate(quads):
        half=capture.crop((index*800,0,(index+1)*800,1600));matrix=[];vector=[]
        for (x,y),(u,v) in zip(target,[(0,0),(800,0),(800,1600),(0,1600)]):
            matrix.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);vector.extend([u,v])
        coeff=np.linalg.solve(np.array(matrix),np.array(vector))
        warped=half.transform(template.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
        aperture=Image.new('L',template.size,0);ImageDraw.Draw(aperture).polygon([tuple(point) for point in target],fill=255)
        warped.putalpha(ImageChops.multiply(warped.getchannel('A'),aperture));template=Image.alpha_composite(template,warped)
    box=template.getbbox();template=template.crop((max(0,box[0]-24),max(0,box[1]-24),min(template.width,box[2]+24),min(template.height,box[3]+24)))
    template.save(OUT/'foldable-chromatic.webp','WEBP',quality=88,method=6)
    receipts.append({'name':'foldable-chromatic','source':os.path.relpath(foldable_source,APP),'sourceSha256':hashlib.sha256(foldable_source.read_bytes()).hexdigest(),'frame':'foldable','screenQuadrilaterals':quads,'outputSha256':hashlib.sha256((OUT/'foldable-chromatic.webp').read_bytes()).hexdigest(),'method':'One continuous real 690px capture, contain-fit and split across a single partly folded display; illustrative device geometry.'})
labs=json.loads((APP/'preview-content/labs.json').read_text())
legacy={'pool-room':'pool-room','walkup-3d':'brownstone-walkup','terminal-3d':'cinematic-3d','pill-scroll':'scroll-motion','micro-animations':'micro-animations','aha-laser':'aha-laser','studio-engine':'studio-engine','growth-street':'growth-street','goliath':'goliath'}
for lab in labs:
    composite('lab-'+lab['slug'],selected['lab-'+lab['slug']]['path'])
for album in json.loads((APP/'preview-content/albums.json').read_text()):
    composite('photo-'+album['id'].removeprefix('album-'),locate(album['photos'][0]['localUrl']),'photo')
boat=Image.open(FRAMES/'boat.png');box=boat.getbbox();boat.crop((max(0,box[0]-24),max(0,box[1]-24),min(boat.width,box[2]+24),min(boat.height,box[3]+24))).save(OUT/'boat.webp','WEBP',quality=92,method=6)
if (FRAMES/'cursor.png').is_file():
    cursor=Image.open(FRAMES/'cursor.png');box=cursor.getbbox();cursor.crop((max(0,box[0]-24),max(0,box[1]-24),min(cursor.width,box[2]+24),min(cursor.height,box[3]+24))).save(OUT/'cursor.webp','WEBP',quality=90,method=6)
(APP.parent/'.lifi/evidence/visual-overhaul/assets/screen-composites.json').write_text(json.dumps(receipts,indent=2)+'\n')
RECEIPTS.write_text(json.dumps(receipts,indent=2)+'\n')
print(f'Composed {len(receipts)} original captures and exact logo extrusion.')
