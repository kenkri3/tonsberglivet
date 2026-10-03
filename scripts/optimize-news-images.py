"""Krymper nyhetsbildene til web-vennlig størrelse og fører opp målene i arkivet.

Bildene fra den gamle siden er lastet ned i full størrelse, og mange av dem er
tunge PNG-skjermbilder (snitt ~380 KB). Her:

  * skaleres alt ned til maks 1600 px bredde,
  * konverteres PNG-er over terskelen til WebP (samme innhold, ~1/4 størrelse),
  * skrives bredde/høyde inn i src/data/news-archive.json, slik at next/image
    kan rendre bildene uten forvrengning.

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
WEBP_QUALITY = 80
PNG_TO_WEBP_THRESHOLD = 120 * 1024


def web_path(name: str) -> str:
    return f"/images/nyheter/{name}"


def optimize(path: Path) -> tuple[str, int, int, int, int]:
    """Skalerer/komprimerer ett bilde.

    Returnerer (ny sti, bredde, høyde, bytes før, bytes etter). Stien endres når
    en tung PNG konverteres til WebP.
    """
    before = path.stat().st_size
    suffix = path.suffix.lower()

    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        width, height = image.size

        if width > MAX_WIDTH:
            height = round(height * (MAX_WIDTH / width))
            image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
            width, height = image.size

        if suffix == ".png" and before > PNG_TO_WEBP_THRESHOLD:
            target = path.with_suffix(".webp")
            image.save(target, "WEBP", quality=WEBP_QUALITY, method=6)
            path.unlink()
            return web_path(target.name), width, height, before, target.stat().st_size

        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        elif suffix == ".png":
            image.save(path, "PNG", optimize=True)
        elif suffix == ".webp":
            image.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
        else:
            image.save(path, optimize=True)

    return web_path(path.name), width, height, before, path.stat().st_size


def main() -> None:
    if not ARCHIVE.exists():
        raise SystemExit(f"Finner ikke {ARCHIVE} – kjør import-wp-news.mjs build først.")

    sizes: dict[str, dict[str, int]] = {}
    renames: dict[str, str] = {}
    total_before = total_after = 0

    for path in sorted(IMAGE_DIR.iterdir()):
        if not path.is_file():
            continue
        old_path = web_path(path.name)
        new_path, width, height, before, after = optimize(path)
        sizes[new_path] = {"width": width, "height": height}
        if new_path != old_path:
            renames[old_path] = new_path
        total_before += before
        total_after += after

    articles = json.loads(ARCHIVE.read_text(encoding="utf-8"))
    missing: set[str] = set()

    def apply_size(node: dict) -> None:
        src = node.get("src")
        if not src:
            return
        if src in renames:
            src = renames[src]
            node["src"] = src
        size = sizes.get(src)
        if size:
            node.update(size)
        else:
            missing.add(src)

    for article in articles:
        if isinstance(article.get("featuredImage"), dict):
            apply_size(article["featuredImage"])
        for block in article.get("blocks", []):
            if block.get("type") == "image":
                apply_size(block)

    ARCHIVE.write_text(json.dumps(articles, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"Optimaliserte {len(sizes)} bilder: {total_before / 1024 / 1024:.1f} MB -> {total_after / 1024 / 1024:.1f} MB")
    print(f"Konverterte {len(renames)} PNG-er til WebP.")
    if missing:
        print(f"ADVARSEL: {len(missing)} bilder i arkivet mangler fil:")
        for src in sorted(missing):
            print(f"  {src}")


if __name__ == "__main__":
    main()
