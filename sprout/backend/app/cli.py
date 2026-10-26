"""Bulk-ingest a folder:  python -m app.cli ../knowledge"""
import asyncio
import sys
from pathlib import Path

from .ingest import ingest_folder


async def main(folder: str) -> None:
    result = await ingest_folder(Path(folder))
    for r in result["ingested"]:
        print(f"ingested {r['source']:<35} category={r['category']:<10} chunks={r['chunks']}")
    for r in result["skipped"]:
        print(f"skipped  {r['source']}: {r['reason']}")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "../knowledge"))
