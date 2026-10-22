# Runbook: únik nebo podezření na únik tajného klíče

Cíl: do 60 minut od zjištění je kompromitovaný klíč neplatný a nový nasazený.

## 0. Okamžitě (0–10 min)
1. Nezkoušej „jen smazat commit“. Klíč považuj za zneužitý.
2. Zapiš čas zjištění, kdo zjistil, kde klíč unikl (repo, log, screenshot, chat, AI kontext, npm balíček).
3. Ohlas incident lead (viz `SECURITY.md`) → postup `incident-runbook.md`, pokud byl klíč s přístupem k datům.

## 1. Rotace podle typu klíče

| Klíč | Postup |
|---|---|
| Supabase secret key (nový typ) | Dashboard → Settings → API Keys → vytvoř nový secret key → nasaď do Vercel env (Sensitive) a Edge secrets → redeploy → **smaž starý klíč** → ověř, že starý vrací 401 |
| Supabase legacy `service_role` | Rotace JWT secretu zneplatní i `anon` klíč a všechny relace → naplánuj krátký výpadek; zároveň migruj na nové API klíče |
| JWT signing key | Vytvoř standby klíč → rotuj → revokuj starý (odhlásí relace podepsané starým klíčem) |
| DB heslo | Settings → Database → Reset password → aktualizuj CI secret → ověř migrace |
| Stripe | Dashboard → Developers → API keys → Roll key (případně s expirací starého) → webhook secret zvlášť |
| Resend / e-mail | Smaž API key, vytvoř nový s „sending access“ jen pro doménu |
| Vercel token | Account → Tokens → revoke; zkontroluj Audit log na neznámé deploye a změny env |
| GitHub token / deploy key | Revoke; zkontroluj audit log organizace, nové SSH klíče, webhooky, Actions secrets |
| AI poskytovatel | Revoke key, nastav nový s limitem útraty |
| Integrace n8n/Make | Rotuj credentials ve scénářích a odvolej OAuth přístup |

## 2. Vyšetření (paralelně)
- Supabase logs (API, Postgres, Auth): požadavky se secret key z neznámých IP, neobvyklé objemy `select`, `rpc`, Storage download.
- Vercel: Runtime logs, Audit log, nové deploymenty, změny env/domén.
- Stripe/Resend: události, odeslané e-maily, refundy, nové webhooky.
- Rozhodni o hlášení úniku osobních údajů (72 h, `vizeon-sec-gdpr-legal`).

## 3. Úklid
- Odstraň klíč z historie gitu (`git filter-repo`) až **po** rotaci; uvědom si, že forky/klony a cache ho mohou mít dál.
- Přidej pravidlo do gitleaks / pre-commit, aby se stejný typ úniku nezopakoval.
- Aktualizuj `secrets-inventory.md` (datum rotace) a zapiš poučení do `incident-log`.

## 4. Pravidelná rotace (bez incidentu)
- Secret keys a tokeny integrací: min. 1× ročně a vždy při odchodu člověka s přístupem.
- DB heslo: při odchodu člověka.
- Tokeny CI: krátká platnost, ideálně OIDC místo statických tokenů.
