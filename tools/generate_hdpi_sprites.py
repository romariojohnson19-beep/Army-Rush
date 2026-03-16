"""Utility script to up-scale menu sprites for 2x/3x density screens."""
from pathlib import Path

from PIL import Image

ICON_NAMES = [
    "play",
    "hq",
    "pilot",
    "upgrades",
    "galaxy",
    "stats",
    "moon",
]

SCALE_SUFFIXES = {
    2: "@2x",
    3: "@3x",
}

BASE_DIR = Path(__file__).resolve().parent.parent / "assets" / "sprites" / "menu"


def ensure_output(sprite_name: str) -> None:
    source = BASE_DIR / f"{sprite_name}.png"
    if not source.exists():
        print(f"[warn] Missing base sprite: {source}")
        return

    with Image.open(source) as img:
        for scale, suffix in SCALE_SUFFIXES.items():
            target = BASE_DIR / f"{sprite_name}{suffix}.png"
            resized = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
            resized.save(target)
            rel_path = target.relative_to(BASE_DIR.parent.parent)
            print(f"[ok] Wrote {rel_path} ({scale}x)")


def main() -> None:
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    for name in ICON_NAMES:
        ensure_output(name)


if __name__ == "__main__":
    main()
