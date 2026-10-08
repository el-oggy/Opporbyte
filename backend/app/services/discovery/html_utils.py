"""HTML utilities for normalizing job description text."""

import html
import re
from html.parser import HTMLParser
from io import StringIO


class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = StringIO()

    def handle_data(self, d):
        self.text.write(d)

    def handle_starttag(self, tag, attrs):
        if tag in ["p", "br", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6"]:
            self.text.write("\n")

    def get_data(self):
        return self.text.getvalue()


def clean_html_to_text(html_content: str) -> str:
    """Convert HTML string to clean, normalized plain text."""
    if not html_content:
        return ""
    try:
        s = HTMLTextExtractor()
        s.feed(html_content)
        plain = s.get_data()
    except Exception:
        # Fallback to simple regex stripping
        plain = re.sub(r"<[^>]+>", " ", html_content)

    plain = html.unescape(plain)
    # Normalize multiple newlines and spaces
    plain = re.sub(r"[ \t]+", " ", plain)
    plain = re.sub(r"\n\s*\n\s*\n+", "\n\n", plain)
    return plain.strip()
