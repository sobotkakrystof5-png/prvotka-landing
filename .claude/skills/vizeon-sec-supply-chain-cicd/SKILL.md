---
name: vizeon-sec-supply-chain-cicd
description: Bezpečnost dodavatelského řetězce a CI/CD – výběr a ověřování npm balíčků (slopsquatting, typosquatting, npm červi typu Shai-Hulud), lockfile, ignore-scripts, minimální stáří vydání, SCA/Dependabot, SBOM, patchování Next.js/React CVE, GitHub (privátní repo, branch protection, CODEOWNERS, review), GitHub Actions (permissions, připnutí na SHA, pull_request_target, OIDC), secret scanning, SAST, bezpečné migrace a deploy, rollback. Použij při přidávání závislosti, nastavování repozitáře, psaní CI workflow, nasazování a při každé zprávě o kritické zranitelnosti. Pokrývá sekce O a P.
---

# Závislosti, GitHub a CI/CD (sekce O, P)

Útoky přes dodavatelský řetězec (kompromitované npm balíčky, červi kradoucí tokeny z vývojářských strojů a CI, škodlivé GitHub Actions) jsou v letech 2025–2026 jednou z hlavních cest průniku. OWASP Top 10:2025 je řadí jako samostatnou kategorii (A03 Software Supply Chain Failures).

## Závislosti (sekce O)

### Před přidáním balíčku (#165, #171, N-17)
Ověř a zapiš do PR popisu:
- [ ] Balíček **existuje** a název přesně odpovídá (ne `supabase-js`, ale `@supabase/supabase-js`) – typosquatting / AI halucinace.
- [ ] Repozitář, maintainer, počet stažení, datum první verze (podezřelé: nový balíček s podobným názvem jako populární).
- [ ] Nepotřebuji ho? Standardní knihovna / existující závislost / 20 řádků vlastního kódu je často bezpečnější.
- [ ] Má `preinstall`/`postinstall` skripty? Proč?
- [ ] Licence kompatibilní s dodávkou klientovi.

### Konfigurace instalací (#170, #171, N-18)
- Lockfile (`pnpm-lock.yaml`/`package-lock.json`) **vždy commitnutý**; v CI `pnpm install --frozen-lockfile` / `npm ci`.
- Doporučený správce: **pnpm 10+** – lifecycle skripty závislostí jsou ve výchozím stavu blokované; povolují se jmenovitě (`onlyBuiltDependencies`). Nastav `minimumReleaseAge` (např. 1440–4320 minut), aby se neinstalovaly verze publikované před pár hodinami (typický vzor kompromitací).
- U npm: `.npmrc` s `ignore-scripts=true` (`assets/npmrc`) a výslovné spuštění nutných build skriptů.
- Přesné verze (`save-exact`), aktualizace jen přes Dependabot/Renovate PR s review.
- Nepoužívané závislosti odstraňuj (`npx knip` / `depcheck` – spouštět ručně, ne agentem bez schválení) (#166).

### Zranitelnosti (#167–#169, #174, N-04)
- Podporované verze Node.js (LTS), Next.js, React, `@supabase/*`. Sleduj security advisories Next.js, React, Supabase a Vercel.
- **Kritické CVE ve frameworku = patch do 24–48 h** (příklady z praxe: CVE-2025-29927 – obejití Next.js middleware; CVE-2025-55182 – RCE v React Server Components). Postup: ověř zasažené verze v advisory, aktualizuj, nasaď, zkontroluj logy na zneužití.
- SCA v CI: `npm audit --audit-level=high` / `pnpm audit` + `osv-scanner` + Dependabot alerts. **High/Critical v produkčních závislostech blokuje merge**, pokud není doloženo, že se nás netýká (zapsat do `exceptions.md` s termínem).
- SBOM (#174): pro náročnější projekty `npx @cyclonedx/cyclonedx-npm --output-file sbom.json` jako artefakt každého release.
- Tokeny k registrům (#172): vývojář nemá publikační npm token; pokud publikujete balíčky, používejte trusted publishing (OIDC) a 2FA.

## GitHub (sekce P)

### Nastavení repozitáře a organizace
- Repozitář **privátní** (#175). Organizace: povinné 2FA pro všechny členy, minimum ownerů, odebírání přístupů při odchodu (#119, #263).
- **Branch protection / Ruleset na `main`** (#176, #177): PR povinný, min. 1 schválení, schválení od CODEOWNERS pro citlivé cesty, povinné status checks (testy + security workflow), zakázaný force push a mazání, žádné výjimky pro adminy (#185).
- `CODEOWNERS` (`assets/CODEOWNERS`): `supabase/migrations/`, `src/server/auth*`, `src/server/authz*`, `src/server/admin/`, `app/api/webhooks/`, `.github/`, `.claude/` → vyžadují review odpovědné osoby.
- Zapni: Secret scanning + Push protection, Dependabot alerts + security updates, Private vulnerability reporting, CodeQL default setup (#179).
- Commity podepisované (SSH/GPG) – doporučeno pro produkční repa.

### GitHub Actions (#180, #181, N-19)
- `permissions:` na úrovni workflow minimální (`contents: read`), rozšiřuj jen u jobu, který potřebuje.
- **Akce třetích stran připnuté na commit SHA** (ne `@v4`, ne `@main`) – tagy lze přepsat. Dependabot pro `github-actions` je aktualizuje.
- **Nikdy `pull_request_target` s checkoutem kódu z PR** – dá cizímu kódu přístup k secrets. Workflow z forků nemají secrets.
- Secrets jen v **Environments** s ochranou (production = required reviewers, jen `main`).
- Deploy do cloudu přes **OIDC** místo dlouhodobých tokenů, kde to platforma podporuje.
- Nevkládej `${{ github.event.* }}` (titulek PR, název větve) přímo do `run:` – script injection. Předávej přes `env:`.
- Self-hosted runnery pro veřejná repa nikdy.

### Pipeline (#178, #179, #182, #248)
Šablona `assets/security.yml`:
1. Secret scan (gitleaks) celé historie PR.
2. Lint + typecheck + unit/integrační testy včetně negativních autorizačních testů.
3. RLS testy proti lokální Supabase (`supabase start` + `supabase test db`).
4. SAST (Semgrep `p/nextjs`, `p/typescript`, `p/react`, `p/secrets` + CodeQL).
5. SCA (`npm audit` / `osv-scanner`).
6. `sec-scan.sh` z `vizeon-sec-code-review`.
7. Audit SQL (`vizeon-sec-supabase/scripts/audit.sql`) proti lokální DB po aplikaci migrací – nenulový výsledek u P0 sekcí = fail.

## Nasazování (#182–#185)
- Produkce se nasazuje **jen z `main` přes CI/Vercel Git integraci**, ne z vývojářského stroje ani agentem.
- Každé nasazení dohledatelné ke commitu (Vercel to zajišťuje; nepoužívej `vercel deploy` z lokálu do produkce).
- **Rollback**: Vercel Instant Rollback – vyzkoušej ho před ostrým provozem. Pozor: rollback kódu nevrací DB migrace → migrace navrhuj zpětně kompatibilní (expand → migrate → contract).
- **Migrace do produkce** (#184): CI job s ručním schválením (GitHub Environment `production`), před destruktivní migrací záloha/PITR bod, migrace otestovaná na stagingu s produkčně podobným objemem.
- Výjimky z povinných kontrol (#185) jen zapsané v `exceptions.md` se schválením a termínem.

## Kontroly: #165–#185, #248, N-04, N-17, N-18, N-19
Šablony: `assets/security.yml`, `assets/dependabot.yml`, `assets/npmrc`, `assets/CODEOWNERS`
