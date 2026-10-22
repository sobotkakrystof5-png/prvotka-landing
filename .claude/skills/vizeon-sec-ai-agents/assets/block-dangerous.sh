#!/usr/bin/env bash
# VIZEON – PreToolUse hook pro Claude Code.
# Blokuje: čtení secrets, destruktivní a produkční příkazy, exfiltraci přes síť,
# vypínání RLS a zápis secret klíčů do klientského kódu.
# Exit 2 = akce zablokována, stderr se vrátí agentovi jako důvod.
# Vyžaduje: jq. Umístění: .claude/hooks/block-dangerous.sh (chmod +x)

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "VIZEON hook: chybí jq – bezpečnostní hook nemůže běžet. Nainstaluj jq." >&2
  exit 2
fi

input="$(cat)"
tool="$(jq -r '.tool_name // ""' <<<"$input")"

block() { echo "VIZEON SECURITY BLOCK: $1" >&2; exit 2; }

# Cesty k citlivým souborům
secret_path_re='(^|/)(\.env($|\.)|secrets/|id_rsa|id_ed25519|\.pem$|\.key$|\.p12$|\.pfx$|\.npmrc$|\.netrc$|\.aws/|\.ssh/|\.supabase/|\.vercel/|\.config/gh/|service[-_]?account.*\.json$)'
# .env.example je povolený
allow_path_re='\.env\.example$'

case "$tool" in
  Read|Edit|Write|Grep|Glob)
    path="$(jq -r '.tool_input.file_path // .tool_input.path // .tool_input.pattern // ""' <<<"$input")"
    if [[ -n "$path" ]] && [[ "$path" =~ $secret_path_re ]] && ! [[ "$path" =~ $allow_path_re ]]; then
      block "přístup k citlivému souboru '$path' je zakázán. Požádej člověka o potřebnou (necitlivou) informaci."
    fi
    if [[ "$tool" == "Write" || "$tool" == "Edit" ]]; then
      content="$(jq -r '(.tool_input.content // "") + "\n" + (.tool_input.new_string // "")' <<<"$input")"
      # secret key do NEXT_PUBLIC nebo do klientského kódu
      if grep -Eq 'NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD)' <<<"$content"; then
        block "NEXT_PUBLIC_* proměnná se jménem SECRET/SERVICE_ROLE/PRIVATE/PASSWORD by se dostala do prohlížeče."
      fi
      if grep -Eq "^['\"]use client['\"]" <<<"$content" && grep -Eq '(SUPABASE_SECRET_KEY|SERVICE_ROLE|service_role|createAdminClient)' <<<"$content"; then
        block "secret key / admin klient v klientské komponentě ('use client')."
      fi
      # vložené skutečné klíče
      if grep -Eq '(sb_secret_[A-Za-z0-9_-]{10,}|sk_live_[A-Za-z0-9]{10,}|rk_live_[A-Za-z0-9]{10,}|re_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)' <<<"$content"; then
        block "obsah vypadá jako skutečný tajný klíč. Klíče patří do secret managementu, ne do souborů."
      fi
      # vypnutí RLS / USING (true)
      if grep -Eiq 'disable[[:space:]]+row[[:space:]]+level[[:space:]]+security' <<<"$content"; then
        block "vypnutí RLS je zakázané (VIZEON P0). Pokud je to výjimka, musí ji schválit člověk."
      fi
      if grep -Eiq 'using[[:space:]]*\([[:space:]]*true[[:space:]]*\)|with[[:space:]]+check[[:space:]]*\([[:space:]]*true[[:space:]]*\)' <<<"$content"; then
        block "RLS politika USING (true) / WITH CHECK (true) je zakázaná pro neveřejná data. Napiš politiku s kontrolou členství, nebo požádej člověka o výjimku."
      fi
    fi
    ;;
  Bash)
    cmd="$(jq -r '.tool_input.command // ""' <<<"$input")"
    # čtení secrets přes shell
    if grep -Eq '(cat|less|more|head|tail|bat|grep|rg|awk|sed|source|\.)[[:space:]][^|;&]*\.env($|[^.a-zA-Z]|\.(local|production|prod|development|staging))' <<<"$cmd"; then
      block "čtení .env přes shell je zakázané."
    fi
    if grep -Eq '(printenv|(^|[;&|[:space:]])env[[:space:]]*$|(^|[;&|[:space:]])set[[:space:]]*$|export[[:space:]]+-p|/proc/[^[:space:]]*/environ)' <<<"$cmd"; then
      block "výpis proměnných prostředí je zakázaný (mohou obsahovat secrets)."
    fi
    # destruktivní a produkční operace
    if grep -Eq '(rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f|rm[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*r)[[:space:]]+(/|~|\$HOME|\.\.?/?$|\*)' <<<"$cmd"; then
      block "rekurzivní mazání široké cesty."
    fi
    if grep -Eiq '(supabase[[:space:]]+db[[:space:]]+push|supabase[[:space:]]+link|vercel[[:space:]].*--prod|git[[:space:]]+push[[:space:]].*(--force|-f([[:space:]]|$))|git[[:space:]]+reset[[:space:]]+--hard|npm[[:space:]]+publish|drop[[:space:]]+(table|schema|database)|truncate[[:space:]]+)' <<<"$cmd"; then
      block "destruktivní nebo produkční operace – musí ji provést člověk (nebo CI po schválení)."
    fi
    # síťová exfiltrace a pipe-to-shell
    if grep -Eq '(curl|wget)[^|]*\|[[:space:]]*(ba|z)?sh' <<<"$cmd"; then
      block "spuštění skriptu staženého z internetu (pipe to shell)."
    fi
    if grep -Eq '(^|[[:space:];&|])(curl|wget|nc|ncat|scp|rsync)[[:space:]]' <<<"$cmd"; then
      block "síťové nástroje jsou pro agenta zakázané; použij WebFetch nebo požádej člověka."
    fi
    # obcházení hooků a pravidel
    if grep -Eq '(\.claude/settings|\.claude/hooks|--dangerously-skip-permissions|--no-verify)' <<<"$cmd"; then
      block "změna bezpečnostní konfigurace agenta nebo obcházení git hooků."
    fi
    ;;
esac

exit 0
