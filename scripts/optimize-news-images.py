"""Holder bildestiene i nyhetsarkivet i takt med filene i public/images/nyheter.

Bakgrunn: arkivet (src/data/news-archive.json) lagrer bildestier som tekst, og en
annen import har siden lastet ned de samme bildene på nytt med en annen
filendelse (`.jpg` i stedet for `.webp`). Da peker arkivet på filer som ikke
finnes, og kortene viser ødelagte bilder.

Skriptet gjør tre ting, i denne rekkefølgen:

  1. Løser hver bildesti i arkivet opp mot filen som FAKTISK ligger på disk
     (samme grunnnavn, hvilken som helst av .webp/.jpg/.jpeg/.png/.avif).
  2. Skalerer ned og komprimerer bildene som brukes (maks 1600 px, JPEG q82,
     tunge PNG-er blir WebP).
  3. Skriver sti, bredde og høyde tilbake til arkivet, og rapporterer hver
     referanse som fortsatt ikke har en fil.

Kjøres med den medfølgende Python-tolkningen (Pillow).
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "public" / "images" / "nyheter"
ARCHIVE = ROOT / "src" / "data" / "news-archive.json"

MAX_WIDTH = 1600
JPEG_QUALITY = 82
WEBP_QUALITY = 82
PNG_TO_WEBP_THRESHOLD = 120 * 1024
MIN_BYTES_TO_TOUCH = 200 * 1024

# Rekkefølgen vi foretrekker når samme bilde finnes i flere formater.
EXTENSION_ORDER = [".webp", ".jpg", ".jpeg", ".png", ".avif"]


def web_path(name: str) -> str:
    return f"/images/nyheter/{name}"


def build_index() -> dict[str, list[str]]:
    """grunnnavn -> filnavnene som finnes på disk."""
    index: dict[str, list[str]] = {}
    for path in IMAGE_DIR.iterdir():
        if path.is_file():
            index.setdefault(path.stem, []).append(path.name)
    return index


def resolve(src: str, index: dict[str, list[str]]) -> str | None:
    """Finner filen på disk som svarer til en bildesti fra arkivet."""
    if not src.startswith("/images/"):
        return None
    name = src.rsplit("/", 1)[-1]
    stem = name.rsplit(".", 1)[0]
    candidates = index.get(stem)
    if not candidates:
        return None
    if name in candidates:
        return name
    return sorted(
        candidates,
        key=lambda n: EXTENSION_ORDER.index(Path(n).suffix.lower())
        if Path(n).suffix.lower() in EXTENSION_ORDER
        else len(EXTENSION_ORDER),
    )[0]


def encode(image: Image.Image, target: Path, suffix: str) -> None:
    """Koder bildet til target i formatet som hører til filendelsen.

    Formatet sendes eksplisitt: midlertidige filer har endelsen .tmp, og da
    klarer ikke Pillow å gjette formatet selv.
    """
    if suffix in {".jpg", ".jpeg"}:
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        image.save(target, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    elif suffix == ".png":
        image.save(target, "PNG", optimize=True)
    elif suffix == ".webp":
        image.save(target, "WEBP", quality=WEBP_QUALITY, method=6)
    else:
        image.save(target, image.format or "PNG", optimize=True)


def optimize(path: Path) -> tuple[str, int, int]:
    """Skalerer/komprimerer ett bilde og returnerer (ny sti, bredde, høyde).

    Vi beholder ALLTID den minste varianten: en ny koding som blir større enn
    originalen kastes, slik at kjøringen aldri gjør repoet tyngre.
    """
    size = path.stat().st_size
    suffix = path.suffix.lower()
    original = path.read_bytes()

    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        width, height = image.size

        needs_resize = width > MAX_WIDTH
        needs_recode = (suffix == ".png" and size > PNG_TO_WEBP_THRESHOLD) or size > MIN_BYTES_TO_TOUCH

        if not needs_resize and not needs_recode:
            return web_path(path.name), width, height

        if needs_resize:
            height = round(height * (MAX_WIDTH / width))
            image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
            width, height = image.size

        # Tunge PNG-er blir WebP – men bare hvis det faktisk blir lettere.
        if suffix == ".png" and size > PNG_TO_WEBP_THRESHOLD:
            target = path.with_suffix(".webp")
            encode(image, target, ".webp")
            if target.stat().st_size < size:
                path.unlink()
                return web_path(target.name), width, height
            target.unlink()
            encode(image, path, ".png")

        else:
            temp = path.with_suffix(path.suffix + ".tmp")
            encode(image, temp, suffix)
            if temp.stat().st_size < size:
                temp.replace(path)
            else:
                temp.unlink()
                path.write_bytes(original)

    return web_path(path.name), width, height


def main() -> None:
    if not ARCHIVE.exists():
        raise SystemExit(f"Finner ikke {ARCHIVE} – kjør import-wp-news.mjs build først.")

    articles = json.loads(ARCHIVE.read_text(encoding="utf-8"))
    index = build_index()

    # 1. Løs opp alle referanser mot filene som faktisk finnes.
    references: list[dict] = []
    unresolved: list[str] = []
    retargeted = 0

    def collect(node: dict) -> None:
        nonlocal retargeted
        src = node.get("src")
        if not src:
            return
        name = resolve(src, index)
        if not name:
            unresolved.append(src)
            return
        if web_path(name) != src:
            node["src"] = web_path(name)
            retargeted += 1
        references.append(node)

    for article in articles:
        if isinstance(article.get("featuredImage"), dict):
            collect(article["featuredImage"])
        for block in article.get("blocks", []):
            if block.get("type") == "image":
                collect(block)

    # 2. Optimaliser filene som faktisk brukes, og husk nye navn og mål.
    optimized: dict[str, tuple[int, int]] = {}
    renamed: dict[str, str] = {}
    for node in references:
        name = node["src"].rsplit("/", 1)[-1]
        path = IMAGE_DIR / name
        if not path.exists():
            continue
        before = node["src"]
        new_src, width, height = optimize(path)
        optimized[new_src] = (width, height)
        if new_src != before:
            renamed[before] = new_src

    # 3. Skriv sti og mål tilbake.
    for node in references:
        src = renamed.get(node["src"], node["src"])
        if src in optimized:
            width, height = optimized[src]
            node["src"] = src
            node["width"] = width
            node["height"] = height
        elif node["src"] not in unresolved:
            unresolved.append(node["src"])

    ARCHIVE.write_text(json.dumps(articles, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"Saker i arkivet       : {len(articles)}")
    print(f"Bildereferanser       : {len(references)}")
    print(f"Flyttet til riktig fil : {retargeted}")
    print(f"Uten fil på disk      : {len(unresolved)}")
    for src in unresolved[:15]:
        print(f"  MANGLER {src}")


if __name__ == "__main__":
    main()
