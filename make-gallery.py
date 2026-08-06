from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("[오류] Pillow가 설치되지 않았습니다.")
    print("터미널에서 python -m pip install pillow 를 한 번 실행해 주세요.")
    input("엔터를 누르면 종료합니다.")
    sys.exit(1)

BASE = Path(__file__).resolve().parent
PHOTOS = BASE / "photos"
ASSETS = BASE / "assets" / "gallery"
DATA_FILE = BASE / "gallery-data.js"
DAYS = [f"day{i}" for i in range(1, 6)]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
THUMB_MAX = 480
FULL_MAX = 2000
THUMB_QUALITY = 72
FULL_QUALITY = 85


def natural_key(path: Path):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)", path.name)]


def to_rgb(image: Image.Image) -> Image.Image:
    if image.mode == "RGB":
        return image
    if image.mode in ("RGBA", "LA"):
        rgba = image.convert("RGBA")
        bg = Image.new("RGB", rgba.size, "white")
        bg.paste(rgba, mask=rgba.getchannel("A"))
        return bg
    return image.convert("RGB")


def resize(image: Image.Image, max_size: int) -> Image.Image:
    result = image.copy()
    result.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    return result


def process_day(day: str):
    source = PHOTOS / day
    thumb_dir = ASSETS / day / "thumbs"
    full_dir = ASSETS / day / "full"

    source.mkdir(parents=True, exist_ok=True)
    if thumb_dir.parent.exists():
        shutil.rmtree(thumb_dir.parent)
    thumb_dir.mkdir(parents=True, exist_ok=True)
    full_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(
        (p for p in source.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS),
        key=natural_key,
    )
    items = []
    print(f"\n[{day}] {len(files)}장 처리")

    for index, file in enumerate(files, 1):
        name = f"{index:03d}"
        thumb = thumb_dir / f"{name}.webp"
        full = full_dir / f"{name}.jpg"
        try:
            with Image.open(file) as opened:
                image = to_rgb(ImageOps.exif_transpose(opened))
                resize(image, THUMB_MAX).save(thumb, "WEBP", quality=THUMB_QUALITY, method=6)
                resize(image, FULL_MAX).save(full, "JPEG", quality=FULL_QUALITY, optimize=True, progressive=True)
            items.append({
                "thumb": f"assets/gallery/{day}/thumbs/{thumb.name}",
                "full": f"assets/gallery/{day}/full/{full.name}",
            })
            print(f"  {index:03d}  {file.name}")
        except Exception as exc:
            print(f"  [건너뜀] {file.name}: {exc}")
    return items


def main():
    print("=" * 48)
    print("동일본·한국 청년교류단 사진 자동 변환")
    print("=" * 48)
    data = {day: process_day(day) for day in DAYS}
    DATA_FILE.write_text(
        "// 자동 생성 파일: 직접 수정하지 마세요.\nwindow.GALLERY_DATA = "
        + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    total = sum(map(len, data.values()))
    print("\n" + "=" * 48)
    print(f"완료: 총 {total}장")
    print("생성 위치: assets/gallery")
    print("사진 목록: gallery-data.js")
    print("이제 변경된 폴더 전체를 GitHub에 업로드하세요.")
    print("=" * 48)


if __name__ == "__main__":
    main()
