"""Project approved captures into the reviewed physical device renders.

Only viewport cropping, uniform scaling, perspective and aperture masks are
applied to client pixels. The untouched library originals remain authoritative.
"""
from pathlib import Path
from PIL import Image, ImageChops
import hashlib,json,os,sys
import numpy as np
from approved_screens import selected_originals, approved_originals, require_approved

APP=Path(__file__).resolve().parents[1]
ROOT=APP.parent
FRAMES=ROOT/'.lifi/asset-work/website-devices'
OUT=APP/'public/assets/sculpture'
RECEIPT=ROOT/'.lifi/design-source/sculpture/screen-composites.json'
selected=selected_originals();approved=approved_originals()
jobs={
 'hair-by-rachel-charles':('iphone','hair-by-rachel-charles-phone'),
 'cc-films':('desktop','cc-films-desktop'),
 'easy-tiger':('iphone','easy-tiger-phone'),
 'the-break-room':('duo','the-break-room-duo-20261008'),
 'clearhelp':('tablet','clearhelp-tablet-20261008'),
 'army-navy-bags':('desktop','army-navy-bags-desktop'),
 'brothers-pizzeria':('desktop','brothers-pizzeria-desktop'),
 'grand-funding-llc':('tablet','grand-funding-llc-tablet-20261008'),
 'legacy-music-group':('desktop','legacy-music-group-desktop'),
 'logan-loans':('iphone','logan-loans-phone'),
 'the-tarot-hotline':('duo','the-tarot-hotline-duo-20261008'),
}
receipts=json.loads(RECEIPT.read_text())
for slug,(device,key) in jobs.items():
 if len(sys.argv)>1 and device not in sys.argv[1:]:continue
 name='website-'+slug
 source=require_approved(selected[key]['path'],approved)
 original=Image.open(source).convert('RGBA')
 meta=json.loads((FRAMES/(device+'-frame.json')).read_text())
 frame=Image.open(FRAMES/(device+'-frame.png')).convert('RGBA')
 mask_path=FRAMES/({'iphone':'iphone-frame-screen-mask.png','desktop':'desktop-frame-aperture-mask.png'}.get(device,device+'-frame-mask.png'))
 mask_image=Image.open(mask_path).convert('RGBA')
 mask=ImageChops.multiply(mask_image.getchannel('R'),mask_image.getchannel('A'))
 quad=meta.get('screenQuadrilateral') or meta['quad']
 if isinstance(quad,dict):quad=[quad[k] for k in ['TL','TR','BR','BL']]
 aspect=meta.get('screenAspect') or meta.get('physicalScreenAspectRatio') or meta.get('screenPhysicalSize',{}).get('aspect')
 assert aspect and frame.size==mask.size
 w=original.width;h=round(w/aspect)
 # The browser viewport begins below the real iPhone cutout. Keep the page's
 # navigation readable rather than painting it underneath the island.
 top=round(w*.135) if device=='iphone' else 0
 bottom=round(w*.025) if device=='iphone' else 0
 content_height=h-top-bottom
 crop=selected[key].get('crop') or [0,0,original.width,original.height]
 available=original.crop(crop)
 if available.height>=content_height:
  crop=[crop[0],crop[1],crop[2],crop[1]+content_height]
 else:
  content_width=round(available.height*w/content_height)
  left=crop[0]+(available.width-content_width)//2
  crop=[left,crop[1],left+content_width,crop[3]]
 capture=Image.new('RGBA',(w,h),original.getpixel((min(5,w-1),min(5,original.height-1))))
 content=original.crop(crop)
 # Difference from exact scaling is at most one rounding pixel.
 assert abs(content.width/content.height-w/content_height)<.004
 content=content.resize((w,content_height),Image.Resampling.LANCZOS)
 capture.alpha_composite(content,(0,top))
 matrix=[];vector=[]
 for (x,y),(u,v) in zip(quad,[(0,0),(w,0),(w,h),(0,h)]):
  matrix.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);vector.extend([u,v])
 coeff=np.linalg.solve(np.array(matrix),np.array(vector))
 warped=capture.transform(frame.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
 warped.putalpha(ImageChops.multiply(warped.getchannel('A'),mask))
 result=Image.alpha_composite(frame,warped)
 bounds=result.getbbox();padding=12
 bounds=(max(0,bounds[0]-padding),max(0,bounds[1]-padding),min(result.width,bounds[2]+padding),min(result.height,bounds[3]+padding))
 result=result.crop(bounds)
 target=OUT/(name+'.webp');result.save(target,'WEBP',quality=91,method=6)
 receipts[:]=[r for r in receipts if r['name']!=name]
 receipts.append({'name':name,'source':os.path.relpath(source,APP),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':crop,'frame':device,'frameSource':os.path.relpath(FRAMES/(device+'-frame.png'),APP),'frameSha256':hashlib.sha256((FRAMES/(device+'-frame.png')).read_bytes()).hexdigest(),'screenQuadrilateral':quad,'screenAspect':aspect,'safeAreaPixels':{'top':top,'bottom':bottom},'outputSize':result.size,'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'method':'Reviewed approved original, documented viewport crop, uniform scale and deterministic perspective into a physical device; no reconstructed client pixels.'})
 print(name,result.size,'viewport crop',crop)
RECEIPT.write_text(json.dumps(receipts,indent=2)+'\n')
