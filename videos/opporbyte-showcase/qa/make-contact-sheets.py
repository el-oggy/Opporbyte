from PIL import Image, ImageDraw
from pathlib import Path
root=Path.cwd()/"videos/opporbyte-showcase/qa"
for shape in ["landscape", "portrait"]:
    size=(420,236) if shape=="landscape" else (236,420)
    columns=4
    sheet=Image.new("RGB", (columns*size[0],2*(size[1]+32)),"#f4e7d2")
    draw=ImageDraw.Draw(sheet)
    for i,t in enumerate([0,3,7,12,17,22,28,34]):
        pic=Image.open(root/shape/f"frame-{t:.3f}.png").convert("RGB").resize(size)
        x,y=(i%columns)*size[0],(i//columns)*(size[1]+32)
        sheet.paste(pic,(x,y)); draw.text((x+12,y+size[1]+9),f"{t}s",fill="#202420")
    sheet.save(root/shape/"contact-sheet.png")
