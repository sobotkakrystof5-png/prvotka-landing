#!/usr/bin/env bash
# Pre-handover check: leftover placeholders + empty headings.
# Usage: predani-check.sh <project-root>
set -u
root="${1:-.}"
fail=0

echo "== Zbytky placeholderů =="
hits=$(grep -rnIiE 'REPLACE-WITH|TODO|FIXME|lorem ipsum|example\.com|\bXXX\b|000 000|\bTBD\b|doplnit' \
  --include='*.html' --include='*.xml' --include='*.txt' --include='*.json' --include='*.js' --include='*.css' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=.vercel \
  --exclude='package-lock.json' "$root" 2>/dev/null)
if [ -n "$hits" ]; then echo "$hits"; fail=1; else echo "OK"; fi

echo
echo "== Nadpisy bez textu =="
python3 -I - "$root" <<'PY' || fail=1
import sys, os, re
from html.parser import HTMLParser

class P(HTMLParser):
    # Heading is empty if the next heading of the same or higher rank arrives
    # before any text does. A sub-heading (h2 -> h3) counts as content.
    def __init__(self):
        super().__init__(); self.cur=None; self.out=[]; self.skip=0; self.intag=None
    def handle_starttag(self, t, a):
        if t in ("script","style","svg"): self.skip+=1
        if re.fullmatch(r"h[1-6]", t):
            lvl=int(t[1])
            if self.cur and not self.cur["body"] and lvl<=self.cur["lvl"]:
                self.out.append((self.cur["line"], "h%d"%self.cur["lvl"], self.cur["text"]))
            if self.cur and lvl>self.cur["lvl"]:
                self.cur["body"]=True
            self.cur={"lvl":lvl,"line":self.getpos()[0],"text":"","body":False}
            self.intag=t
    def handle_endtag(self, t):
        if t in ("script","style","svg") and self.skip: self.skip-=1
        if t==self.intag: self.intag=None
    def handle_data(self, d):
        if self.skip or not self.cur or not d.strip(): return
        if self.intag: self.cur["text"]+=d.strip()
        else: self.cur["body"]=True

bad=0
for dp, dn, fn in os.walk(sys.argv[1]):
    dn[:] = [d for d in dn if d not in ("node_modules",".git",".claude",".vercel")]
    for f in fn:
        if f.endswith(".html"):
            p=P(); p.feed(open(os.path.join(dp,f),encoding="utf-8",errors="ignore").read())
            for line,tag,text in p.out:
                print(f"{os.path.join(dp,f)}:{line}: <{tag}> \"{text}\" nemá pod sebou žádný text"); bad=1
print("OK" if not bad else "")
sys.exit(bad)
PY

echo
[ "$fail" -eq 0 ] && echo "Vše čisté." || echo "Nalezeny problémy, oprav před nasazením."
exit "$fail"
