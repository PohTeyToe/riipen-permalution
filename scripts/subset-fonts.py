"""Trim the two variable fonts to what this page can show, so they can be inlined.

Sources: the latin woff2 files of @fontsource-variable/archivo (wdth axis build)
and @fontsource-variable/schibsted-grotesk, both SIL Open Font License 1.1.
The body font keeps Basic Latin, Latin-1 and typographic punctuation, since
visitors type into fields set in it. The display font only sets the page's own
copy, so it keeps Basic Latin, French and Spanish letters, that punctuation,
and only the axis ranges the CSS uses.

    pip install fonttools==4.55.3 brotli==1.1.0
    python scripts/subset-fonts.py <dir with the fontsource files>
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'fonts')
ASCII = set(range(0x20, 0x7F))
PUNCT = {0xA0, 0xAB, 0xB0, 0xB7, 0xBB, 0x2009, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x202F, 0x20AC, 0x2192}
LETTERS = {ord(c) for c in 'àâäçéèêëîïôöùûüÿñáíóúœæ' + 'àâäçéèêëîïôöùûüÿñáíóúœæ'.upper()}
BODY = ASCII | set(range(0xA0, 0x100)) | PUNCT | {0x152, 0x153}
DISPLAY = ASCII | PUNCT | LETTERS


def trim(src, chars, limits, name):
    font = TTFont(src)
    if limits:
        font = instancer.instantiateVariableFont(font, limits)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'ccmp', 'locl', 'tnum', 'pnum', 'rvrn']
    opts.name_IDs = ['*']
    s = subset.Subsetter(opts)
    s.populate(unicodes=chars)
    s.subset(font)
    path = os.path.join(OUT, name)
    subset.save_font(font, path, opts)
    print(name, os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    src = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    trim(os.path.join(src, 'archivo-wdth-latin.woff2'), DISPLAY, {'wght': (500, 900), 'wdth': (100, 125)}, 'archivo.woff2')
    trim(os.path.join(src, 'schibsted-grotesk-latin.woff2'), BODY, None, 'schibsted-grotesk.woff2')
