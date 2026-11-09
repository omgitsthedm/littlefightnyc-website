from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
base = Path(__file__).parent / sys.argv[1]
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 18)
for width, count, cols, cw, ch in [(1440,6,3,500,410),(393,8,4,300,460),(834,8,4,330,430)]:
    files=[p for p in sorted(base.glob('*-'+str(width)+'.png')) if p.name[:2].isdigit()]
    for start in range(0,len(files),count):
        canvas=Image.new('RGB',(cols*cw,2*ch),'#111318'); d=ImageDraw.Draw(canvas)
        for i,p in enumerate(files[start:start+count]):
            x=(i%cols)*cw; y=(i//cols)*ch
            im=Image.open(p).convert('RGB'); im.thumbnail((cw-24,ch-58))
            canvas.paste(im,(x+12+(cw-24-im.width)//2,y+42+(ch-58-im.height)//2))
            d.text((x+12,y+8),p.name.rsplit('-'+str(width),1)[0][:int(cw/10)],font=font,fill='#eeeeee')
        canvas.save(base/f'board-{width}-{start//count+1:02d}.jpg',quality=95)
