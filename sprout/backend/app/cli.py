"""Bulk-ingest a folder:  python -m app.cli ../knowledge"""
import asyncio
import sys
from pathlib import Path

from .chunking import SUPPORTED
from .ingest import ingest_file


async def main(folder: str) -> None:
    root = Path(folder)
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() in SUPPORTED:
            # sub-folder name becomes the category (knowledge/courses/x.md -> "courses")
            category = path.parent.name.lower() if path.parent != root else "general"
            r = await ingest_file(path.name, path.read_bytes(), category)
            print(f"ingested {r['source']:<35} category={r['category']:<10} chunks={r['chunks']}")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "../knowledge"))
