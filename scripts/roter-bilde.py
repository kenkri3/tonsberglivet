"""
Retter bilder som ligger rotert 90 grader.

Bakgrunn: en full bildegransking fant at handelens-dager-gode-sommertilbud-.jpg
ligger pa siden - jenta ligger ned og skiltteksten star loddrett. Bildet er
ellers et helt greit, ekte fotografi, sa det skal roteres, ikke byttes.

Kjoeres: python scripts/roter-bilde.py <fil> <retning>
  retning: cw (med klokka) eller ccw (mot klokka)
"""
import sys
import pathlib
from PIL import Image

fil = pathlib.Path(sys.argv[1])
retning = sys.argv[2] if len(sys.argv) > 2 else "cw"

with Image.open(fil) as im:
    print(f"For:  {im.size[0]}x{im.size[1]}")
    rotert = im.rotate(-90 if retning == "cw" else 90, expand=True)
    rotert.save(fil, "JPEG", quality=88, optimize=True, progressive=True)

with Image.open(fil) as im:
    print(f"Etter: {im.size[0]}x{im.size[1]}  (rotert {retning})")
