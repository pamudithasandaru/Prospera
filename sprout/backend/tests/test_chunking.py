import pytest

from app.chunking import chunk_text, extract_text


def test_headings_become_sections():
    text = "# Courses\n\nIntro text.\n\n## Irrigation\n\nDrip systems save water."
    chunks = chunk_text(text, size=40, overlap=0)
    assert any(c.section == "Irrigation" and "Drip" in c.text for c in chunks)


def test_chunks_respect_size_and_cover_text():
    text = "\n\n".join(f"Paragraph number {i} about crops." for i in range(40))
    chunks = chunk_text(text, size=200, overlap=30)
    assert len(chunks) > 3
    assert all(len(c.text) <= 200 for c in chunks)
    joined = " ".join(c.text for c in chunks)
    assert "Paragraph number 0 " in joined and "Paragraph number 39" in joined


def test_long_paragraph_is_split():
    text = "Sentence about soil. " * 200
    assert len(chunk_text(text, size=300, overlap=0)) > 5


def test_empty_text_yields_no_chunks():
    assert chunk_text("   \n\n  ") == []


def test_extract_txt_and_unsupported():
    assert extract_text("a.txt", b"hello") == "hello"
    with pytest.raises(ValueError):
        extract_text("a.exe", b"x")
