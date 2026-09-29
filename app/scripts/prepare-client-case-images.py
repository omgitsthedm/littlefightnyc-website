"""Frame dated website captures without generating or changing their contents.

Input is an unpacked read-only capture artifact. Fonts are used only while
rendering; no font files are copied into the output or evidence package.
"""
from pathlib import Path
import argparse, hashlib, io, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser()
parser.add_argument('--captures', type=Path, required=True)
parser.add_argument('--app', type=Path, default=Path(__file__).resolve().parents[1])
args = parser.parse_args()
app = args.app.resolve()
source = args.captures / 'app/public/assets/cases/2026-09-29'
assets = app / 'public/assets/cases/2026-09-29'
output = assets
records = json.loads((app / 'src/data/client-case-studies.json').read_text())
manifest = []


def font(size, weight=500):
    path = app / f'node_modules/@fontsource/barlow/files/barlow-latin-{weight}-normal.woff'
    f = TTFont(path); f.flavor = None
    stream = io.BytesIO(); f.save(stream); stream.seek(0)
    return ImageFont.truetype(stream, size)


def rounded_paste(canvas, image, xy, radius):
    mask = Image.new('L', image.size)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, image.width - 1, image.height - 1), radius=radius, fill=255)
    canvas.paste(image, xy, mask)


def frame(canvas, image, x, y, width, domain, phone=False):
    border = 9 if phone else 2
    bar = 25 if phone else 30
    screen_width = width - border * 2
    height = round(screen_width * image.height / image.width)
    frame_height = height + bar + border * 2
    radius = 24 if phone else 15
    shadow = Image.new('RGBA', canvas.size)
    ImageDraw.Draw(shadow).rounded_rectangle((x, y+12, x+width, y+frame_height+12), radius=radius, fill=(0,0,0,140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(shadow)
    surface = Image.new('RGB', (width, frame_height), '#1A1C23')
    d = ImageDraw.Draw(surface)
    if phone:
        d.rounded_rectangle((width//2-22, 10, width//2+22, 13), radius=2, fill='#72747C')
    else:
        for index in range(3):
            d.ellipse((14+index*11, 12, 19+index*11, 17), fill='#72747C')
        label_font = font(14)
        d.text((width//2, 15), domain, font=label_font, fill='#CACBD2', anchor='mm')
    shot = image.resize((screen_width, height), Image.Resampling.LANCZOS)
    surface.paste(shot, (border, border+bar))
    rounded_paste(canvas, surface, (x,y), radius)
    ImageDraw.Draw(canvas).rounded_rectangle((x, y, x+width-1, y+frame_height-1), radius=radius, outline='#42444C', width=1)


def composition(desktop, mobile, client, domain, social=False):
    size = (1200, 630) if social else (1600, 1000)
    canvas = Image.new('RGBA', size, '#0B0C10')
    d = ImageDraw.Draw(canvas)
    x = 44 if social else 64
    title_size = 32 if social else 44
    title = font(title_size, 600)
    while d.textbbox((0,0), client, font=title)[2] > size[0]-2*x:
        title_size -= 1; title = font(title_size, 600)
    d.text((x, 23 if social else 37), 'LITTLE FIGHT NYC / CLIENT WORK', font=font(14 if social else 18), fill='#A1A1AA')
    d.text((x, 47 if social else 71), client, font=title, fill='#FFFFFF')
    if social:
        frame(canvas, desktop, 44, 103, 685, domain)
        frame(canvas, mobile, 857, 112, 217, domain, True)
    else:
        frame(canvas, desktop, 64, 189, 1030, domain)
        frame(canvas, mobile, 1217, 169, 301, domain, True)
        d = ImageDraw.Draw(canvas)
        d.text((64, 961), domain, font=font(18), fill='#A1A1AA')
        d.text((1518, 961), 'DESKTOP + PHONE', font=font(16), fill='#A1A1AA', anchor='ra')
    return canvas.convert('RGB')


def save(image, target, quality=92):
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.suffix == '.jpg':
        image.save(target, 'JPEG', quality=94, subsampling=0, optimize=True)
    else:
        image.save(target, 'WEBP', quality=quality, method=6)
    manifest.append(dict(path=str(target.relative_to(app)), width=image.width, height=image.height,
        bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest()))


def capture(folder, name):
    path = folder / (name+'.png')
    if not path.exists(): path = folder / (name+'.webp')
    if not path.exists(): raise FileNotFoundError(f'Missing real capture: {path}')
    return Image.open(path).convert('RGB')


for record in records:
    slug = record['slug']; folder = source/slug
    desktop, tablet, mobile = [capture(folder, 'home-'+v) for v in ['desktop','tablet','mobile']]
    for image, suffix in [(desktop,'desktop-1440'),(tablet,'tablet-1024'),(mobile,'mobile-390')]:
        save(image, assets/f'case-{slug}-{suffix}.webp')
    save(capture(folder,'detail-desktop'), output/slug/'detail-desktop.webp')
    for device, suffix in [('explore',''),('explore-tablet','-tablet'),('explore-mobile','-mobile')]:
        im = capture(folder,'home-'+device)
        # A real full-page capture cropped to a bounded scrollable sample.
        im = im.crop((0,0,im.width,min(im.height,2400)))
        save(im,assets/f'case-{slug}-explore{suffix}.webp',94)
    domain = record['url'].split('//',1)[1].rstrip('/')
    cover = composition(desktop,mobile,record['client'],domain)
    save(cover,assets/f'case-{slug}.webp')
    for width in [480,640,900]:
        save(cover.resize((width,round(width*cover.height/cover.width)),Image.Resampling.LANCZOS),assets/f'case-{slug}-{width}.webp')
    save(composition(desktop,mobile,record['client'],domain,True),assets/'social'/f'og-case-{slug}.jpg')

evidence=app.parent/'.lifi/evidence/cases/custom-domains-2026-09-29'
evidence.mkdir(parents=True,exist_ok=True)
(evidence/'rendered-image-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Prepared {len(manifest)} faithful image exports for {len(records)} cases.')
