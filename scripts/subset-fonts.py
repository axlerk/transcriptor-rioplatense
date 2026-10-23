#!/usr/bin/env python3
"""Build the self-hosted font subsets in fonts/.

Usage: python3 scripts/subset-fonts.py <dir-with-source-ttfs>
Needs fonttools and brotli (pip install fonttools brotli).

Sources (google/fonts repository, ofl/): charissil/CharisSIL-{Regular,Italic,Bold}.ttf,
ibmplexsans/IBMPlexSans[wdth,wght].ttf, ibmplexmono/IBMPlexMono-Medium.ttf.
The OFL forbids Reserved Font Names ("Charis", "SIL", "Plex") on modified
fonts, and a subset is a modified font, so the families are renamed.
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer

# Latin, Latin-1, Latin Ext-A (ŋ ž), IPA Extensions, spacing modifiers (ˈ ˌ),
# combining marks (̞ ̯ ̪), β, punctuation (– … ‖ ‿), arrows.
IPA = "20-7E,A0-FF,100-17F,250-2AF,2B0-2FF,300-36F,3B2,2010-2027,2030-203F,2190-2193,2212"
LATIN = "20-7E,A0-FF,100-17F,2010-2027"
UI = "20-7E,A0-FF,100-17F,2010-2027,2030-203A,2190-2193,2212,2715"

FONTS = [
    # source, output, family, style, variable-font weight, ranges
    ("CharisSIL-Regular.ttf", "rio-serif-400.woff2", "Rio IPA Serif", "Regular", None, IPA),
    ("CharisSIL-Italic.ttf", "rio-serif-400i.woff2", "Rio IPA Serif", "Italic", None, LATIN),
    ("CharisSIL-Bold.ttf", "rio-serif-700.woff2", "Rio IPA Serif", "Bold", None, LATIN),
    ("IBMPlexSans[wdth,wght].ttf", "rio-sans-400.woff2", "Rio UI Sans", "Regular", 400, UI),
    ("IBMPlexSans[wdth,wght].ttf", "rio-sans-600.woff2", "Rio UI Sans", "SemiBold", 600, UI),
    ("IBMPlexMono-Medium.ttf", "rio-mono-500.woff2", "Rio UI Mono", "Medium", None, LATIN),
]


def codepoints(ranges):
    cps = set()
    for r in ranges.split(","):
        a, _, b = r.partition("-")
        cps.update(range(int(a, 16), int(b or a, 16) + 1))
    return cps


def build(src, out, family, style, weight, ranges):
    font = TTFont(src)
    if weight:
        font = instancer.instantiateVariableFont(font, {"wght": weight, "wdth": 100})
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    opts.hinting = False
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=codepoints(ranges))
    sub.subset(font)
    ps = f"{family}-{style}".replace(" ", "")
    for rec in font["name"].names:
        rec.string = {1: family, 16: family, 2: style, 17: style,
                      4: f"{family} {style}", 6: ps, 3: f"{ps};subset"}.get(rec.nameID, rec.string)
    font.flavor = "woff2"
    font.save(out)
    print(f"{out.name}: {out.stat().st_size} bytes")


if __name__ == "__main__":
    src_dir = Path(sys.argv[1])
    out_dir = Path(__file__).resolve().parent.parent / "fonts"
    for src, out, *rest in FONTS:
        build(src_dir / src, out_dir / out, *rest)
