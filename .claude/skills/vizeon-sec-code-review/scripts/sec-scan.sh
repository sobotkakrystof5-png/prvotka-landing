#!/usr/bin/env bash
# VIZEON sec-scan – rychlý heuristický scanner nebezpečných vzorů pro Next.js + Supabase projekty.
# NENAHRAZUJE review, SAST ani testy. Hledá typické chyby (i z AI generovaného kódu).
#
# Použití:  bash tools/security/sec-scan.sh [--ci] [cesta]
#   --ci   exit 1 při jakémkoli P0 nálezu
# Výjimky:  řádek s komentářem  "sec-scan: ignore <důvod>"  se přeskočí (zdůvodni v PR).

set -uo pipefail

CI=0
ROOT="."
for a in "$@"; do
  case "$a" in
    --ci) CI=1 ;;
    *) ROOT="$a" ;;
  esac
done
cd "$ROOT" || exit 2

EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build
          --exclude-dir=.git --exclude-dir=coverage --exclude-dir=.vercel --exclude-dir=.turbo
          --exclude-dir=security --exclude-dir=.claude)
CODE=(--include=*.ts --include=*.tsx --include=*.js --include=*.jsx --include=*.mjs --include=*.cjs)
SQL=(--include=*.sql)
ANY=("${CODE[@]}" "${SQL[@]}" --include=*.json --include=*.yml --include=*.yaml --include=*.env* --include=*.md --include=*.toml)

P0=0; P1=0; P2=0
RED=$'\033[31m'; YEL=$'\033[33m'; BLU=$'\033[36m'; RST=$'\033[0m'
[[ -t 1 ]] || { RED=""; YEL=""; BLU=""; RST=""; }

report() { # sev title matches
  local sev="$1" title="$2" matches="$3"
  matches="$(printf '%s\n' "$matches" | grep -v 'sec-scan: ignore' | sed '/^$/d')"
  [[ -z "$matches" ]] && return
  local n; n=$(printf '%s\n' "$matches" | wc -l | tr -d ' ')
  case "$sev" in
    P0) P0=$((P0+n)); printf '%s[P0]%s %s (%s)\n' "$RED" "$RST" "$title" "$n" ;;
    P1) P1=$((P1+n)); printf '%s[P1]%s %s (%s)\n' "$YEL" "$RST" "$title" "$n" ;;
    P2) P2=$((P2+n)); printf '%s[P2]%s %s (%s)\n' "$BLU" "$RST" "$title" "$n" ;;
  esac
  printf '%s\n' "$matches" | head -n 25 | sed 's/^/      /'
  [[ "$n" -gt 25 ]] && echo "      … a další"
  echo
}
g() { grep -rnE "${EXCLUDES[@]}" "$@" . 2>/dev/null; }
gi() { grep -rniE "${EXCLUDES[@]}" "$@" . 2>/dev/null; }

echo "== VIZEON sec-scan: $(pwd) =="
echo

# ---------------- Secrets ----------------
report P0 "Secret v NEXT_PUBLIC_* proměnné (dostane se do prohlížeče)" \
  "$(g "${ANY[@]}" 'NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|_TOKEN)' | grep -v '\.env\.example')"
report P0 "Vypadá jako skutečný klíč v souboru" \
  "$(g "${ANY[@]}" '(sb_secret_[A-Za-z0-9_-]{16,}|sk_live_[A-Za-z0-9]{16,}|rk_live_[A-Za-z0-9]{16,}|whsec_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[bap]-[A-Za-z0-9-]{20,})')"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  report P0 ".env soubor je verzovaný v gitu" \
    "$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.env\.example$|\.env\.sample$')"
fi
report P0 "Vypnuté ověřování TLS" \
  "$(g "${CODE[@]}" '(rejectUnauthorized:[[:space:]]*false|NODE_TLS_REJECT_UNAUTHORIZED)')"

# ---------------- Supabase / DB ----------------
report P0 "Vypnuté RLS" "$(gi "${SQL[@]}" 'disable[[:space:]]+row[[:space:]]+level[[:space:]]+security')"
report P0 "RLS politika USING (true) / WITH CHECK (true)" \
  "$(gi "${SQL[@]}" '(using|with[[:space:]]+check)[[:space:]]*\(?[[:space:]]*\(?[[:space:]]*true[[:space:]]*\)')"
report P0 "Autorizace přes user_metadata / raw_user_meta_data (uživatel si ji přepíše)" \
  "$(gi "${CODE[@]}" "${SQL[@]}" '(user_metadata|raw_user_meta_data)[^;]*(role|admin|permission|org|tenant|plan)')"

# SECURITY DEFINER bez search_path – kontrola po souborech
secdef=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  if ! grep -qiE 'search_path' "$f"; then secdef+="$f: SECURITY DEFINER bez 'set search_path'"$'\n'; fi
done < <(grep -rliE "${EXCLUDES[@]}" "${SQL[@]}" 'security[[:space:]]+definer' . 2>/dev/null)
report P0 "SECURITY DEFINER bez search_path" "$secdef"

# Views bez security_invoker
views=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  f="${line%%:*}"
  if ! grep -qiE 'security_invoker' "$f"; then views+="$line"$'\n'; fi
done < <(grep -rniE "${EXCLUDES[@]}" "${SQL[@]}" 'create[[:space:]]+(or[[:space:]]+replace[[:space:]]+)?view' . 2>/dev/null)
report P1 "VIEW bez security_invoker (obchází RLS)" "$views"

report P1 "GRANT pro anon – ověř, že je záměr" "$(gi "${SQL[@]}" 'grant[[:space:]].*[[:space:]]to[[:space:]]+anon')"
report P1 "Veřejný Storage bucket" "$(gi "${SQL[@]}" "${CODE[@]}" "(public[[:space:]]*[:=][[:space:]]*true|'public',[[:space:]]*true|createBucket\([^)]*public:[[:space:]]*true)")"
report P1 "Funkce bez REVOKE EXECUTE (zkontroluj migraci)" \
  "$(for f in $(grep -rliE "${EXCLUDES[@]}" "${SQL[@]}" 'create[[:space:]]+(or[[:space:]]+replace[[:space:]]+)?function' . 2>/dev/null); do grep -qiE 'revoke[[:space:]].*execute|revoke[[:space:]]+all[[:space:]]+on[[:space:]]+function' "$f" || echo "$f: CREATE FUNCTION bez REVOKE EXECUTE"; done)"
report P1 "Materializovaný pohled (nemá RLS)" "$(gi "${SQL[@]}" 'create[[:space:]]+materialized[[:space:]]+view')"
report P1 "Destruktivní SQL v migraci – vyžaduje lidské schválení a zálohu" \
  "$(gi "${SQL[@]}" '(drop[[:space:]]+(table|schema|column|policy)|truncate[[:space:]]|delete[[:space:]]+from[[:space:]]+[a-z_.]+[[:space:]]*;)')"

# ---------------- Next.js / server ----------------
admin_in_client=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  if grep -qE '(SUPABASE_SECRET_KEY|SERVICE_ROLE|service_role|createAdminClient|server/admin)' "$f"; then
    admin_in_client+="$f: secret key / admin klient v 'use client' souboru"$'\n'
  fi
done < <(grep -rlE "${EXCLUDES[@]}" "${CODE[@]}" "^[[:space:]]*['\"]use client['\"]" . 2>/dev/null)
report P0 "Secret key / admin klient v klientské komponentě" "$admin_in_client"

report P1 "Secret key / admin klient mimo admin modul a webhooky – ověř vlastní autorizaci" \
  "$(g "${CODE[@]}" '(SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|createAdminClient\()' | grep -vE '(server/admin/|api/webhooks/|\.test\.|\.spec\.)')"

noauth=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  if ! grep -qE '(authorize\(|requireUser\(|requireMembership\(|requireAal2\(|getUser\(|getClaims\()' "$f"; then
    noauth+="$f: 'use server' soubor bez requireUser/authorize"$'\n'
  fi
done < <(grep -rlE "${EXCLUDES[@]}" "${CODE[@]}" "^[[:space:]]*['\"]use server['\"]" . 2>/dev/null)
report P0 "Server Actions bez autentizace/autorizace (každý export je veřejný endpoint)" "$noauth"

routes=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  [[ "$f" == *webhook* || "$f" == *cron* || "$f" == *health* || "$f" == *auth/callback* ]] && continue
  if ! grep -qE '(authorize\(|requireUser\(|requireMembership\(|getUser\(|getClaims\()' "$f"; then
    routes+="$f: Route Handler bez kontroly identity (veřejný záměrně? přidej do něj ignore komentář)"$'\n'
  fi
done < <(find . \( -name node_modules -o -name .next -o -name .git \) -prune -o \( -name 'route.ts' -o -name 'route.js' \) -print 2>/dev/null)
report P1 "Route Handlery bez autentizace" "$routes"

cron=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  grep -qE 'CRON_SECRET|authorization' "$f" || cron+="$f: cron endpoint bez ověření CRON_SECRET"$'\n'
done < <(find . \( -name node_modules -o -name .next -o -name .git \) -prune -o -path '*cron*' \( -name 'route.ts' -o -name 'route.js' \) -print 2>/dev/null)
report P0 "Cron endpoint bez tajemství" "$cron"

hooks=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  grep -q "sec-scan: ignore" "$f" && continue
  grep -qiE '(constructEvent|verify|signature|svix|hmac|timingSafeEqual)' "$f" || hooks+="$f: webhook bez ověření podpisu"$'\n'
done < <(find . \( -name node_modules -o -name .next -o -name .git \) -prune -o -path '*webhook*' \( -name 'route.ts' -o -name 'route.js' -o -name 'index.ts' \) -print 2>/dev/null)
report P0 "Webhook bez ověření podpisu" "$hooks"

report P1 "getSession() na serveru (neověřuje JWT) – použij getUser()/getClaims()" \
  "$(g "${CODE[@]}" 'auth\.getSession\(' | grep -vE '(use client|components/|\.test\.)')"
report P1 "Autorizace jen v middleware/proxy? Ověř, že kontrola je i v DAL" \
  "$(g "${CODE[@]}" '(role|isAdmin|is_admin|permission)' | grep -E '(^\./(src/)?(middleware|proxy)\.(ts|js))')"
report P0 "eval / new Function" "$(g "${CODE[@]}" '(^|[^a-zA-Z_.])(eval\(|new[[:space:]]+Function\()')"
report P1 "child_process s řetězcem (command injection)" "$(g "${CODE[@]}" '(exec|execSync)\([[:space:]]*`')"
report P1 "dangerouslySetInnerHTML – nutná sanitizace (DOMPurify) a CSP" "$(g "${CODE[@]}" 'dangerouslySetInnerHTML')"
report P1 "Mass assignment – insert/update s celým vstupem" \
  "$(g "${CODE[@]}" '\.(insert|update|upsert)\([[:space:]]*(body|input|data|values|payload|req\.body|formData|Object\.fromEntries|\.\.\.)')"
report P1 "PostgREST .or()/.filter() se šablonou – možná injekce filtru" "$(g "${CODE[@]}" '\.(or|filter)\([[:space:]]*`')"
report P1 "Raw SQL se šablonovým řetězcem" "$(g "${CODE[@]}" '(sql|query|execute|raw)\([[:space:]]*`[^`]*\$\{')"
report P1 "redirect() z parametru – ověř safeNext (open redirect)" \
  "$(g "${CODE[@]}" 'redirect\([^)]*(searchParams|params\.|query\.|next|returnTo|redirectTo|callbackUrl)')"
report P1 "Logování citlivých hodnot" \
  "$(gi "${CODE[@]}" 'console\.(log|info|debug|error)\([^)]*(password|token|secret|authorization|cookie|apikey|api_key)')"
report P1 "Source mapy v produkci" "$(g "${CODE[@]}" 'productionBrowserSourceMaps:[[:space:]]*true')"
report P2 "Math.random() – nepoužívat pro tokeny/ID" "$(g "${CODE[@]}" 'Math\.random\(\)')"
report P2 "select('*') – posílej do klienta jen potřebná pole" "$(g "${CODE[@]}" "\.select\(['\"]\*['\"]\)")"
report P2 "Statické/cachované renderování – ověř, že nejde o uživatelská data" \
  "$(g "${CODE[@]}" "(force-static|unstable_cache\(|['\"]use cache['\"])")"
report P2 "TODO/FIXME u bezpečnosti" "$(gi "${CODE[@]}" "${SQL[@]}" '(TODO|FIXME|HACK|XXX).*(auth|secur|rls|permission|validat|sanit)')"

# ---------------- CI / GitHub ----------------
if [[ -d .github/workflows ]]; then
  report P1 "pull_request_target ve workflow" "$(grep -rnE 'pull_request_target' .github/workflows 2>/dev/null)"
  report P1 "Nedůvěryhodný vstup přímo v run: (script injection)" \
    "$(grep -rnE 'run:.*\$\{\{[[:space:]]*github\.event\.(pull_request|issue|comment|head_commit)' .github/workflows 2>/dev/null)"
  report P2 "Akce nepřipnutá na commit SHA" \
    "$(grep -rnE 'uses:[[:space:]]*[^ ]+@' .github/workflows 2>/dev/null | grep -vE '@[0-9a-f]{40}' | grep -vE 'uses:[[:space:]]*\./')"
  report P2 "Workflow bez omezení permissions" \
    "$(for f in .github/workflows/*.y*ml; do [[ -f "$f" ]] && ! grep -qE '^permissions:' "$f" && echo "$f"; done)"
fi

# ---------------- Závislosti ----------------
if [[ -f package.json ]]; then
  report P1 "Chybí lockfile" "$( [[ -f pnpm-lock.yaml || -f package-lock.json || -f yarn.lock || -f bun.lock || -f bun.lockb ]] || echo 'package.json bez lockfile')"
  report P2 "Rozsahy verzí místo přesných (^/~/*/latest)" "$(grep -nE '"[^"]+":[[:space:]]*"(\^|~|\*|latest)' package.json | head -n 40)"
fi

echo "== Souhrn: P0=$P0  P1=$P1  P2=$P2 =="
echo "Heuristika: každý nález ověř. Falešně pozitivní řádek označ komentářem 'sec-scan: ignore <důvod>'."
if [[ $CI -eq 1 && $P0 -gt 0 ]]; then
  echo "❌ P0 nálezy blokují merge."
  exit 1
fi
exit 0
