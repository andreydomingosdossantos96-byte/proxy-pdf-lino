#!/usr/bin/env python3
"""Inline fonts into each site template and write the result to public/<slug>/index.html.

Templates reference fonts as url(@font:name) where name is a file in sites/fonts (without .woff2).
Usage: python3 sites/build.py [slug ...]
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
FONTS = ROOT / "fonts"
OUT = ROOT.parent / "public"


def inline(html: str) -> str:
    def repl(m):
        data = base64.b64encode((FONTS / f"{m.group(1)}.woff2").read_bytes()).decode()
        return f"url(data:font/woff2;base64,{data})"
    return re.sub(r"url\(@font:([a-z0-9-]+)\)", repl, html)


def main(slugs):
    slugs = slugs or sorted(p.name for p in ROOT.iterdir() if (p / "template.html").exists())
    for slug in slugs:
        html = inline((ROOT / slug / "template.html").read_text())
        dest = OUT / slug / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)
        print(f"{slug}: {dest.relative_to(ROOT.parent)} ({len(html) // 1024} KB)")


if __name__ == "__main__":
    main(sys.argv[1:])
