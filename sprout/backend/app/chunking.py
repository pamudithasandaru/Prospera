"""Text extraction and chunking for uploaded documents."""
import io
import re
from dataclasses import dataclass
from pathlib import Path

SUPPORTED = {".pdf", ".docx", ".txt", ".md"}


@dataclass
class Chunk:
    text: str
    section: str


def extract_text(filename: str, data: bytes) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        return "\n\n".join((p.extract_text() or "") for p in reader.pages)
    if ext == ".docx":
        from docx import Document

        doc = Document(io.BytesIO(data))
        return "\n\n".join(p.text for p in doc.paragraphs)
    if ext in {".txt", ".md"}:
        return data.decode("utf-8", errors="replace")
    raise ValueError(f"Unsupported file type '{ext}'. Supported: {', '.join(sorted(SUPPORTED))}")


_HEADING = re.compile(r"^(#{1,6})\s+(.*)$")


def chunk_text(text: str, size: int = 900, overlap: int = 150) -> list[Chunk]:
    """Paragraph-aware chunking. The nearest markdown heading is kept as the chunk's section."""
    text = text.replace("\r\n", "\n")
    chunks: list[Chunk] = []
    section = ""
    buf = ""
    buf_section = ""
    fresh = False  # True when buf holds only carried-over overlap, no new text

    for para in re.split(r"\n\s*\n", text):
        para = para.strip()
        if not para:
            continue
        m = _HEADING.match(para.split("\n", 1)[0])
        if m:
            section = m.group(2).strip()
        pieces = [para] if len(para) <= size else _split_long(para, size)
        for piece in pieces:
            if buf and not fresh and len(buf) + len(piece) + 2 > size:
                chunks.append(Chunk(buf.strip(), buf_section))
                buf = buf[-overlap:] if overlap else ""
                fresh = True
            elif buf and fresh and len(buf) + len(piece) + 2 > size:
                buf = ""  # overlap alone would overflow; drop it
                fresh = False
            if not buf:
                buf_section = section
            buf = f"{buf}\n\n{piece}" if buf else piece
            fresh = False
    if buf.strip() and not fresh:
        chunks.append(Chunk(buf.strip(), buf_section))
    return chunks


def _split_long(para: str, size: int) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", para)
    out, cur = [], ""
    for s in sentences:
        while len(s) > size:
            if cur:
                out.append(cur)
                cur = ""
            out.append(s[:size])
            s = s[size:]
        if cur and len(cur) + len(s) + 1 > size:
            out.append(cur)
            cur = ""
        cur = f"{cur} {s}".strip()
    if cur:
        out.append(cur)
    return out
