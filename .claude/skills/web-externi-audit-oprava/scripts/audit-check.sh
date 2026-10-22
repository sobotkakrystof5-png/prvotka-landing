#!/usr/bin/env bash
# Automatická část externího auditu webu. Použití:
#   audit-check.sh <doména bez https://> [--lighthouse]
# Vypisuje OK / CHYBA / POZOR / INFO. Nic nemění, jen čte (curl, dig, validator.w3.org).
# Vyžaduje: curl, dig, python3. Volitelně npx + Chrome (--lighthouse).
set -u
DOMAIN="${1:?Použití: audit-check.sh <doména> [--lighthouse]}"
DOMAIN="${DOMAIN#https://}"; DOMAIN="${DOMAIN#http://}"; DOMAIN="${DOMAIN%%/*}"
APEX="${DOMAIN#www.}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
ok(){ echo "OK      $*"; }; bad(){ echo "CHYBA   $*"; }; warn(){ echo "POZOR   $*"; }; info(){ echo "INFO    $*"; }
hdr(){ echo; echo "== $*"; }

hdr "1. Primární doména a přesměrování"
for h in "$APEX" "www.$APEX"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://$h/"); loc=$(curl -sI "https://$h/" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}')
  info "$h -> $code ${loc:+přesměruje na $loc}"
done
FINAL=$(curl -sL -o "$TMP/page.html" -w '%{url_effective}' "https://$APEX/"); FINALHOST=$(echo "$FINAL" | awk -F/ '{print $3}')
info "obsah se servíruje z $FINALHOST"
CANON=$(grep -o '<link rel="canonical" href="[^"]*"' "$TMP/page.html" | sed 's/.*href="//;s/"$//')
CANONHOST=$(echo "$CANON" | awk -F/ '{print $3}')
if [ -n "$CANON" ] && [ "$CANONHOST" != "$FINALHOST" ]; then
  bad "canonical ($CANON) míří na jiný host než ten, který obsah servíruje ($FINALHOST). Ve Vercelu/hostingu přepni primární doménu. Rozbíjí og:image, security.txt, llms.txt, PSI (přesměrování) a SEO."
else ok "canonical odpovídá hostu $FINALHOST"; fi
HTTPDIRECT=$(curl -s -o /dev/null -w '%{http_code}' --max-redirs 0 "http://$APEX/"); info "http://$APEX -> $HTTPDIRECT (čekáme 301/308 na https)"

hdr "2. Sociální sítě (OG, jazyk, titulní obrázek)"
grep -q '<html[^>]*lang="' "$TMP/page.html" && ok "html lang: $(grep -o '<html[^>]*lang="[^"]*"' "$TMP/page.html" | sed 's/.*lang="//;s/"//')" || bad "chybí <html lang>"
for p in og:title og:description og:url og:locale og:image og:image:width og:image:height og:image:alt twitter:card; do
  grep -q "property=\"$p\"\|name=\"$p\"" "$TMP/page.html" && ok "meta $p" || warn "chybí meta $p"
done
IMG=$(grep -o 'property="og:image" content="[^"]*"' "$TMP/page.html" | sed 's/.*content="//;s/"$//')
if [ -n "$IMG" ]; then
  r=$(curl -s -o /dev/null -w '%{http_code} %{content_type} %{redirect_url}' "$IMG"); info "og:image $IMG -> $r"
  case "$r" in 200\ image/*) ok "og:image se načte bez přesměrování";; *) bad "og:image se nenačte přímo (přesměrování nebo chyba). Scanner hlásí 'rozměry nepodařilo načíst'.";; esac
fi

hdr "3. Soubory v kořeni (security.txt, llms.txt, robots, sitemap)"
for f in .well-known/security.txt llms.txt robots.txt sitemap.xml; do
  r=$(curl -s -o "$TMP/f" -w '%{http_code} %{redirect_url}' "https://$APEX/$f")
  case "$r" in 200*) ok "/$f (200)";; 30*) bad "/$f přesměrovává ($r). Scanner přesměrování nesleduje, proto hlásí 'chybí'.";; *) bad "/$f -> $r";; esac
done
EXP=$(curl -sL "https://$FINALHOST/.well-known/security.txt" | awk -F': ' 'tolower($1)=="expires"{print $2}')
[ -n "$EXP" ] && info "security.txt Expires: $EXP (obnovit nejpozději měsíc předem)"

hdr "4. Hlavičky a cache"
curl -sIL "https://$APEX/" | tr -d '\r' > "$TMP/h"
CSP=$(grep -i '^content-security-policy:' "$TMP/h" | tail -1)
if [ -z "$CSP" ]; then bad "chybí Content-Security-Policy"; else
  SRC=$(echo "$CSP" | tr ';' '\n' | grep -i "script-src" ); STY=$(echo "$CSP" | tr ';' '\n' | grep -i "style-src")
  echo "$SRC" | grep -q "unsafe-eval" && bad "script-src má unsafe-eval" || ok "script-src bez unsafe-eval"
  echo "$SRC" | grep -q "unsafe-inline" && ! echo "$SRC" | grep -q "nonce-\|strict-dynamic" && bad "script-src má unsafe-inline" || ok "script-src bez účinného unsafe-inline"
  echo "$STY" | grep -q "unsafe-inline" && warn "style-src 'unsafe-inline' (scanner to hlásí souhrnně jako 'unsafe-inline'; unsafe-eval u něj může být falešný poplach)"
fi
for k in strict-transport-security x-content-type-options x-frame-options referrer-policy permissions-policy cross-origin-opener-policy; do
  grep -qi "^$k:" "$TMP/h" && ok "$k" || bad "chybí $k"
done
info "Cache-Control HTML: $(grep -i '^cache-control:' "$TMP/h" | tail -1)"
STATIC=$(grep -o '/[A-Za-z0-9_./-]*\.\(jpg\|png\|svg\|webp\)' "$TMP/page.html" | grep -v '^/_next' | head -1)
[ -n "$STATIC" ] && info "Cache-Control $STATIC: $(curl -sIL "https://$FINALHOST$STATIC" | tr -d '\r' | grep -i '^cache-control:' | tail -1) (statika bez hashe: max-age >= 86400)"

hdr "5. DNS a e-mail"
NS=$(dig +short NS "$APEX" | tr '\n' ' '); info "NS: $NS"
SPF=$(dig +short TXT "$APEX" | grep -i 'v=spf1'); [ -n "$SPF" ] && ok "SPF: $SPF" || bad "SPF na $APEX chybí (Google Workspace: v=spf1 include:_spf.google.com ~all)"
DM=$(dig +short TXT "_dmarc.$APEX"); [ -z "$DM" ] && bad "DMARC chybí" || { echo "$DM" | grep -qi 'p=none' && warn "DMARC jen p=none: $DM (cíl quarantine, pak reject)" || ok "DMARC: $DM"; }
found=0; for s in google selector1 selector2 default k1 s1 mail dkim resend; do dig +short TXT "$s._domainkey.$APEX" | grep -q . && { ok "DKIM selektor $s"; found=1; }; done
[ $found = 0 ] && bad "DKIM nenalezen u běžných selektorů (Google Admin -> Gmail -> Ověřování e-mailů)"
MX=$(dig +short MX "$APEX" | tr '\n' ' '); info "MX: $MX"
echo "$MX" | grep -qi google && ! dig +short TXT "google._domainkey.$APEX" | grep -q . && bad "pošta je u Googlu, ale selektor google._domainkey chybí (selektor resend patří jen odesílání přes Resend)"
dig +short DS "$APEX" | grep -q . && ok "DNSSEC (DS záznam)" || warn "DNSSEC nepodepsáno (zapíná se u registrátora)"
dig +short CAA "$APEX" | grep -q . && ok "CAA" || warn "CAA chybí (nepočítá se do skóre; letsencrypt.org pro Vercel)"
dig +short AAAA "$APEX" | grep -q . && ok "AAAA (IPv6)" || warn "AAAA chybí (Vercel AAAA nenabízí, na Vercelu ignorovat)"
dig +short TXT "_mta-sts.$APEX" | grep -q . && ok "MTA-STS" || info "MTA-STS nenastavené (nepočítá se do skóre)"

hdr "6. Strukturovaná data (JSON-LD)"
python3 - "$TMP/page.html" <<'PY'
import re,sys,json
h=open(sys.argv[1],encoding='utf-8').read()
bl=re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>',h,re.S)
if not bl: print("CHYBA   žádný JSON-LD"); sys.exit()
txt=" ".join(bl)
for k,label in (('"telephone"','telefon'),('"email"','e-mail'),('"address"','adresa'),('"sameAs"','sameAs (profily)')):
    print(("OK      " if k in txt else "POZOR   chybí ")+label)
PY

hdr "7. Měření a cookies (falešné poplachy GA)"
if grep -qi 'googletagmanager\.com\|google-analytics\.com\|gtag(' "$TMP/page.html"; then warn "na stránce je Google Analytics/GTM, nutný souhlas s cookies (banner)"; else ok "žádná GA/GTM v HTML. Hlásí-li to scanner, je to falešný poplach (neplést s CSS třídami g-*)."; fi

hdr "8. Formulář a informace o zpracování údajů"
if grep -qi '<form' "$TMP/page.html"; then
  grep -qi 'osobn\|privacy\|gdpr' "$TMP/page.html" && ok "formulář v HTML ze serveru, odkaz na zásady je v HTML" || bad "formulář bez informace o zpracování údajů v HTML ze serveru"
else
  grep -qi 'osobních údajů\|ochrana-osobnich\|privacy' "$TMP/page.html" && ok "formulář se načítá klientsky, informace o údajích je ale v HTML ze serveru" || warn "formulář není v HTML ze serveru a informace o údajích taky ne"
fi

hdr "9. Validita HTML (W3C Nu, jen chyby)"
curl -s -H 'Content-Type: text/html; charset=utf-8' --data-binary @"$TMP/page.html" 'https://validator.w3.org/nu/?out=json' | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: print('INFO    validátor nedostupný'); sys.exit()
e=[m for m in d['messages'] if m['type']=='error']
print('OK      0 chyb' if not e else 'CHYBA   %d chyb:'%len(e))
for m in e[:12]: print('   -',m['message'][:140],'|',m.get('extract','')[:90].replace(chr(10),' '))
"

if [ "${2:-}" = "--lighthouse" ]; then
  hdr "10. Lighthouse (mobil + desktop, Chrome headless)"
  export CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
  for ff in mobile desktop; do
    extra=""; [ $ff = desktop ] && extra="--preset=desktop"
    npx --yes lighthouse@12 "https://$FINALHOST/" --only-categories=performance,accessibility --form-factor=$ff $extra --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="$TMP/$ff.json" --quiet >/dev/null 2>&1
    python3 - "$TMP/$ff.json" "$ff" <<'PY'
import json,sys
try: d=json.load(open(sys.argv[1]))
except Exception: print("INFO    Lighthouse",sys.argv[2],"selhal (zkus znovu, NO_NAVSTART bývá náhodný)"); sys.exit()
print("INFO   ",sys.argv[2],{k:round((v['score'] or 0)*100) for k,v in d['categories'].items()},"LCP",d['audits']['largest-contentful-paint']['displayValue'],"TBT",d['audits']['total-blocking-time']['displayValue'])
for k in ('unused-javascript','legacy-javascript','render-blocking-resources'):
    a=d['audits'].get(k,{})
    if a.get('score') is not None and a['score']<0.9:
        print("POZOR   ",a['title'],a.get('displayValue',''))
        for it in a.get('details',{}).get('items',[])[:3]: print("          ",it.get('url','')[-60:],it.get('wastedBytes',''))
PY
  done
fi
echo; echo "Hotovo. Další postup: SKILL.md, část 3 (oprava) a část 4 (co nejde v kódu)."
