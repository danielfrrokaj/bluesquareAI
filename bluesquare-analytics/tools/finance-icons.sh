#!/bin/zsh
# Generates the Finance page icons with Gemini, in the same 3D style as public/icons/finance.png,
# into public/icons/fin/<name>.png (128x128, transparent). The pages pick them up automatically;
# until a file exists they show line icons instead.
#
# usage (from bluesquare-analytics):  GEMINI_API_KEY=... tools/finance-icons.sh [name ...]
# Uses ../bluesquare-next/tools/generate-icon.sh and cutout-icons.py (Pillow is installed into a temp venv).
set -e
cd "${0:A:h}/.."
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY}"
gen=../bluesquare-next/tools/generate-icon.sh
cut=../bluesquare-next/tools/cutout-icons.py
ref=public/icons/finance.png
out=public/icons/fin
mkdir -p $out
typeset -A subjects
subjects=(
  income       "a stack of coins with a bold upward arrow: money coming in"
  expense      "an open wallet with a bold downward arrow: money going out"
  transactions "a paper receipt with a coin resting on it: a bookkeeping entry"
  net          "a balance scale with a coin on each pan: profit and loss"
  accounts     "a closed wallet with a bank card peeking out of it"
  partners     "a globe with a small handshake badge in front: partner companies"
  other        "a small bank safe with a round dial and a coin"
  by-account   "two stacked bank cards, slightly fanned"
  by-category  "a price tag with a small pie chart on it"
  forecast     "a rising line chart on a card with a small sparkle: a forecast"
)
names=(${@:-${(k)subjects}})
raw=$(mktemp -d)
for n in $names; do
  [[ -z ${subjects[$n]} ]] && { echo "unknown icon: $n"; continue; }
  echo "generating $n…"
  zsh $gen $ref $raw/$n.raw "${subjects[$n]}"
done
venv=$(mktemp -d)
python3 -m venv $venv && $venv/bin/pip -q install pillow
$venv/bin/python -I $cut $raw $out
for f in $out/*.png; do sips -Z 128 $f >/dev/null; done
rm -rf $raw $venv
ls -la $out
