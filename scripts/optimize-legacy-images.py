"""
Komprimerer migrerte bilder til web-format.

Bakgrunn: originalene fra kundens WordPress er ekte høyoppløselige filer, men
mange er 5-15 MB. Å servere dem direkte gjør sidene svært trege. Her skaleres de
ned til maks 1600 px bredde og kodes på nytt som JPEG/WebP i god webkvalitet –
skarp nok for store kort og hero-bilder, men en brøkdel av vekten.

Bilder som allerede er små nok og lette nok røres ikke.

Kjøres:
  python scripts/optimize-legacy-images.py [--dry-run] [mapper...]
"""

import sys
from pathlib import Path

from PIL import Image

MAKS_BREDDE = 1600
MAKS_HOYDE = 1600
JPEG_KVALITET = 82
WEBP_KVALITET = 82

# Rør ikke filer som allerede er lette og små nok
MIN_BYTES_FOR_KOMPRIMERING = 250_000

ROT = Path(__file__).resolve().parent.parent
STANDARD_MAPPER = [
    ROT / "public" / "images" / "nyheter",
    ROT / "public" / "images" / "legacy",
    ROT / "public" / "images" / "tonsberg",
]

BILDE_ENDELSER = {".jpg", ".jpeg", ".png", ".webp"}


def behandle(sti: Path, torr_kjor: bool) -> tuple[int, int, str]:
    """Returnerer (bytes før, bytes etter, status)."""
    for_sok = sti.stat().st_size

    try:
        with Image.open(sti) as im:
            im.load()
            bredde, hoyde = im.size

            if for_sok < MIN_BYTES_FOR_KOMPRIMERING and max(bredde, hoyde) <= MAKS_BREDDE:
                return for_sok, for_sok, "uendret"

            skala = min(MAKS_BREDDE / bredde, MAKS_HOYDE / hoyde, 1.0)
            ny = (max(1, round(bredde * skala)), max(1, round(hoyde * skala)))

            im = im.convert("RGB") if im.mode in ("RGBA", "P", "LA") else im
            if skala < 1.0:
                im = im.resize(ny, Image.LANCZOS)

            mal = sti.with_suffix(".jpg")
            if torr_kjor:
                return for_sok, int(for_sok * 0.15), f"ville blitt {ny[0]}x{ny[1]}"

            # Kode til en midlertidig fil først, og bytt bare hvis resultatet
            # faktisk ble lettere. Uten dette kunne et bilde som allerede var
            # godt komprimert blitt STØRRE av å kodes på nytt, og originalen
            # ville vært tapt.
            midlertidig = sti.with_name(sti.stem + ".__tmp.jpg")
            im.save(midlertidig, "JPEG", quality=JPEG_KVALITET, optimize=True, progressive=True)
            ny_storrelse = midlertidig.stat().st_size

            if ny_storrelse >= for_sok:
                midlertidig.unlink(missing_ok=True)
                return for_sok, for_sok, "uendret"

            if mal.exists() and mal != sti:
                mal.unlink()
            midlertidig.replace(mal)
            if sti != mal and sti.exists():
                sti.unlink()

            return for_sok, ny_storrelse, f"{bredde}x{hoyde} -> {ny[0]}x{ny[1]}"
    except Exception as feil:  # noqa: BLE001
        return for_sok, for_sok, f"FEIL: {feil}"


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    torr_kjor = "--dry-run" in sys.argv
    mapper = [Path(a) for a in args] or STANDARD_MAPPER

    for_alle = 0
    etter_alle = 0
    antall = 0
    feil = 0

    for mappe in mapper:
        if not mappe.exists():
            print(f"  (hopper over, finnes ikke: {mappe})")
            continue

        filer = sorted(f for f in mappe.rglob("*") if f.suffix.lower() in BILDE_ENDELSER)
        print(f"\n=== {mappe.relative_to(ROT)} — {len(filer)} bilder ===")

        for_stor = 0
        etter_stor = 0
        endret = 0

        for sti in filer:
            for_sok, etter_sok, status = behandle(sti, torr_kjor)
            for_stor += for_sok
            etter_stor += etter_sok
            if status.startswith("FEIL"):
                feil += 1
                if feil <= 5:
                    print(f"  {sti.name}: {status}")
                continue
            if status != "uendret":
                endret += 1
                if endret <= 6:
                    print(
                        f"  {sti.name[:48]:50} {for_sok / 1024:7.0f} KB -> "
                        f"{etter_sok / 1024:6.0f} KB  {status}"
                    )

        for_alle += for_stor
        etter_alle += etter_stor
        antall += len(filer)
        print(
            f"  {endret} av {len(filer)} komprimert. "
            f"{for_stor / 1_048_576:.1f} MB -> {etter_stor / 1_048_576:.1f} MB"
        )

    print(f"\n=== TOTALT ({antall} bilder) ===")
    print(f"  Før:  {for_alle / 1_048_576:.1f} MB")
    print(f"  Etter: {etter_alle / 1_048_576:.1f} MB")
    if etter_alle:
        print(f"  Reduksjon: {100 * (1 - etter_alle / max(for_alle, 1)):.0f} %")
    if feil:
        print(f"  Feilet: {feil}")
    if torr_kjor:
        print("  (tørrkjøring – ingenting skrevet)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
