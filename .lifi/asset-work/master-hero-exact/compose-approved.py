from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import numpy as np
import json,hashlib

ROOT=Path(__file__).resolve().parents[3]
WORK=Path(__file__).resolve().parent
LIB=Path('/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Little Fight NYC Verified Screenshots 2026-10-07')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
portrait_source=LIB/'hair-by-rachel-charles/hair-by-rachel-charles-desktop.png'
nav_source=LIB/'chromatic-painting-design/chromatic-painting-design-desktop.png'
photo_source=LIB/'chromatic-painting-design/chromatic-hero-photo.png'

# Preserve actual capture pixels. The Vision mask removes only the portrait's
# wall background; no client face, lettering, photograph or colors are generated.
portrait=Image.open(portrait_source).convert('RGBA').crop((1560,400,2784,2000))
mask=Image.open(WORK/'approved-portrait-mask.png').convert('L').resize(portrait.size,Image.Resampling.LANCZOS)
portrait.putalpha(mask)
portrait=portrait.crop((260,82,1224,920))
portrait=portrait.resize((702,610),Image.Resampling.LANCZOS)
yellow=Image.open(portrait_source).convert('RGB').getpixel((200,400))
front=Image.new('RGBA',(1024,610),yellow+(255,))
front.alpha_composite(portrait,(315,4))
front.save(WORK/'approved-front.png')

nav=Image.open(nav_source).convert('RGBA').crop((0,0,2880,160))
back=Image.new('RGBA',(2880,1560))
back.alpha_composite(nav,(0,0))
photo=ImageOps.fit(Image.open(photo_source).convert('RGBA'),(2880,1400),Image.Resampling.LANCZOS,centering=(.5,.3))
back.alpha_composite(photo,(0,160))
back.save(WORK/'approved-back.png')

def project(layer,size,quad):
    matrix=[];values=[]
    for (x,y),(u,v) in zip(quad,[(0,0),(layer.width,0),(layer.width,layer.height),(0,layer.height)]):
        matrix.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]])
        values.extend([u,v])
    coeff=np.linalg.solve(np.array(matrix),np.array(values))
    return layer.transform(size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)

settings={
 'desktop':{'base':'desktop-v1.png','back':[(369,249),(1180,298),(1180,620),(369,665)],'front':[(814,484),(1325,484),(1325,735),(814,735)],'boat':[(213,447),(297,447),(298,495),(377,495),(395,513),(395,577),(454,584),(455,635),(410,725),(92,725),(92,628),(157,624),(157,580),(209,567),(207,494)]},
 'mobile':{'base':'mobile-v2.png','back':[(229,221),(993,272),(993,650),(229,692)],'front':[(625,459),(1160,459),(1160,782),(625,782)],'boat':[(121,468),(204,466),(211,514),(291,519),(329,550),(329,620),(398,622),(399,683),(346,794),(10,794),(10,668),(63,665),(62,615),(124,606),(120,525)]}
}
receipt=[]
for kind,setting in settings.items():
    base=Image.open(WORK/setting['base']).convert('RGBA')
    rear=project(back,base.size,setting['back'])
    protect=Image.new('L',base.size,255);draw=ImageDraw.Draw(protect)
    draw.polygon(setting['boat'],fill=0)
    # The front browser physically covers the rear screen. Keep its bezel.
    draw.rectangle((784,439,1346,750) if kind=='desktop' else (590,405,1195,802),fill=0)
    rear.putalpha(Image.fromarray(np.minimum(np.array(rear.getchannel('A')),np.array(protect))))
    base.alpha_composite(rear)
    face=project(front,base.size,setting['front'])
    base.alpha_composite(face)
    output=ROOT/'app/public/assets/sculpture'/f'hero-master-{kind}.webp'
    base.convert('RGB').save(output,'WEBP',quality=93,method=6)
    base.convert('RGB').save(WORK/f'{kind}-approved.png')
    receipt.append({'name':f'hero-master-{kind}','frame':'master-hero','source':str(portrait_source),'sourceSha256':sha(portrait_source),'sources':[{'path':str(p),'sha256':sha(p)} for p in [nav_source,photo_source]],'portraitCrop':[1560,400,2784,2000],'portraitMask':'Apple Vision person segmentation; alpha only, original RGB retained','screenQuadrilaterals':{'rear':setting['back'],'front':setting['front']},'outputSize':list(base.size),'outputSha256':sha(output),'method':'Approved source pixels in the master-derived physical stage; real navigation, real original building photo, and original portrait on its existing website yellow. No generated client imagery survives in the visible display interiors.'})
(WORK/'approved-composites.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('Composited both hero scenes with approved client pixels.')
