# Mapa pokrytí – 286 kontrol (A–Z) + doplňky N-xx

Každá kontrola z původního checklistu má právě jeden „domovský“ skill, kde je rozepsaná
do konkrétních pravidel, kódu a způsobu ověření. Čísla `#n` odpovídají původnímu dokumentu.

## Původní kontroly

| Sekce | Kontroly | Domovský skill | Poznámka |
|---|---|---|---|
| A. Architektura a návrh | #1–#10 | `vizeon-sec-threat-model` | #7–#8 také `vizeon-sec-secrets-data` |
| B. Přihlašování a uživatelé | #11–#22 | `vizeon-sec-auth` | #19 také `vizeon-sec-authz-tenancy` |
| C. Autorizace | #23–#34 | `vizeon-sec-authz-tenancy` | DB vrstva v `vizeon-sec-supabase` |
| D. Supabase a PostgreSQL | #35–#52 | `vizeon-sec-supabase` | audit SQL v `scripts/audit.sql` |
| E. API a backend | #53–#64 | `vizeon-sec-nextjs-api` | |
| F. Next.js, React, frontend | #65–#75 | `vizeon-sec-nextjs-api` | #71–#72 viz i `web-security-setup` |
| G. Validace vstupů | #76–#87 | `vizeon-sec-nextjs-api` | #86–#87 také `vizeon-sec-files` |
| H. Soubory a Storage | #88–#99 | `vizeon-sec-files` | Storage RLS v `vizeon-sec-supabase` |
| I. Šifrování, klíče, data | #100–#110 | `vizeon-sec-secrets-data` | |
| J. Relace a cookies | #111–#118 | `vizeon-sec-auth` | |
| K. Hosting a síť | #119–#129 | `vizeon-sec-infra-abuse` | |
| L. Integrace a platby | #130–#137 | `vizeon-sec-nextjs-api` | klíče integrací v `vizeon-sec-secrets-data` |
| M. Claude Code | #138–#152 | `vizeon-sec-ai-agents` | |
| N. AI agenti v produkci | #153–#164 | `vizeon-sec-ai-agents` | #164 také `vizeon-sec-gdpr-legal` |
| O. Závislosti | #165–#174 | `vizeon-sec-supply-chain-cicd` | |
| P. GitHub a CI/CD | #175–#185 | `vizeon-sec-supply-chain-cicd` | |
| Q. Logování a monitoring | #186–#195 | `vizeon-sec-ops-resilience` | |
| R. Rate limiting | #196–#205 | `vizeon-sec-infra-abuse` | |
| S. Zálohy a obnova | #206–#215 | `vizeon-sec-ops-resilience` | |
| T. Incident response | #216–#225 | `vizeon-sec-ops-resilience` | |
| U. GDPR | #226–#235 | `vizeon-sec-gdpr-legal` | |
| V. Automatické testy | #236–#248 | `vizeon-sec-testing` | |
| W. Nezávislé testy, pentest | #249–#258 | `vizeon-sec-testing` | |
| X. Provoz a údržba | #259–#267 | `vizeon-sec-release-gate` | #265 také `vizeon-sec-ai-agents` |
| Y. Pokročilá ochrana | #268–#275 | `vizeon-sec-threat-model` (rozhodnutí) + příslušné oborové skills | |
| Z. Finální schválení | #276–#286 | `vizeon-sec-release-gate` | |

## Doplňky, které v původním checklistu chyběly nebo byly jen naznačené

| ID | Doplněk | Proč je kritický | Skill |
|---|---|---|---|
| N-01 | Autorizace nikdy z `user_metadata`/`raw_user_meta_data` | Uživatel si je přepíše přes `auth.updateUser()` → sám si dá roli admin | authz-tenancy, supabase |
| N-02 | Na serveru `auth.getUser()`/`getClaims()`, nikdy jen `getSession()` | `getSession()` čte cookie bez ověření podpisu | auth |
| N-03 | Middleware/proxy není bezpečnostní hranice (CVE-2025-29927) | Obejití middleware hlavičkou vedlo k přístupu bez přihlášení | nextjs-api |
| N-04 | Okamžité patchování React/Next.js (např. CVE-2025-55182 – RCE v React Server Components) | Kritické RCE na celém frameworku | supply-chain-cicd, nextjs-api |
| N-05 | Výchozí GRANTy Supabase na nové tabulky a `EXECUTE` pro `PUBLIC` na funkce | Nová funkce v `public` je okamžitě volatelná jako RPC i anonymně | supabase |
| N-06 | UPDATE politiky vždy s `WITH CHECK` + neměnnost `org_id` | Bez toho jde záznam „přestěhovat“ do cizí firmy | supabase |
| N-07 | Materializované pohledy nemají RLS; vlastník tabulky RLS obchází bez `FORCE` | Tichý únik přes MV / owner kontext | supabase |
| N-08 | Autorizace Realtime Broadcast/Presence (`realtime.messages`) | Kanály bez politik = odposlech mezi firmami | supabase |
| N-09 | Signed URL nejde odvolat; `upsert` ve Storage vyžaduje SELECT+UPDATE; veřejný bucket obchází RLS | Úniky dokumentů | files |
| N-10 | Bezpečné propojování OAuth účtů (jen ověřené e-maily) | Převzetí účtu přes neověřený e-mail u providera | auth |
| N-11 | Ochrana proti enumeraci účtů a timing rozdílům | Mapování zákazníků konkurence / phishing | auth |
| N-12 | Bezpečné pozvánky do firmy (vázané na e-mail, jednorázové, expirující) | Převzetí přístupu k firmě přes přeposlaný odkaz | authz-tenancy |
| N-13 | Impersonace / podpora „přihlásit se jako“ jen s auditem a souhlasem | Insider threat, zneužití supportu | authz-tenancy |
| N-14 | Business-logic útoky: souběh, záporné částky, číselné řady faktur, manipulace ceny | WAF ani RLS je nezachytí | nextjs-api |
| N-15 | Clickjacking (`frame-ancestors`) pro admin a platební obrazovky | Podvržené kliky | nextjs-api |
| N-16 | SSRF/LFI při generování PDF z HTML (headless Chrome) | Čtení interních služeb / souborů serveru | files |
| N-17 | Slopsquatting – AI vymyšlené názvy balíčků | Útočníci registrují halucinované balíčky | supply-chain-cicd, ai-agents |
| N-18 | npm červi (Shai-Hulud 2025), `ignore-scripts`, minimální stáří vydání | Krádež tokenů z vývojářských strojů a CI | supply-chain-cicd |
| N-19 | GitHub Actions: `pull_request_target`, akce připnuté na SHA, OIDC místo statických klíčů | Únik secrets z CI | supply-chain-cicd |
| N-20 | Claude Code hooks blokující čtení secrets; skills/pluginy/MCP jako dodavatelský řetězec | Prompt injection → exfiltrace | ai-agents |
| N-21 | Honeytokeny / kanárkové záznamy | Včasná detekce průniku | ops-resilience |
| N-22 | Append-only audit log v DB | Útočník nesmí zahladit stopy | ops-resilience |
| N-23 | Offsite neměnné zálohy (object lock) + samostatné zálohy Storage | Ransomware, kompromitace účtu Supabase | ops-resilience |
| N-24 | NIS2 / zákon č. 264/2025 Sb. o kybernetické bezpečnosti – požadavky na dodavatele | Klienti v režimu NIS2 je přenesou smluvně na tebe | gdpr-legal |
| N-25 | Konflikt archivace (účetnictví, DPH, AML) × GDPR výmaz | Nelze „smazat vše“ ani „držet vše navždy“ | gdpr-legal |
| N-26 | AI Act – transparentnost (voice agent musí oznámit, že je AI) | Právní povinnost | gdpr-legal, ai-agents |
| N-27 | Vulnerability disclosure (`security.txt`, kontakt) | Nálezy od výzkumníků se mají kam ohlásit | infra-abuse |
| N-28 | SPF/DKIM/DMARC + ochrana proti e-mail header injection | Phishing jménem klienta | infra-abuse |
| N-29 | Nové Supabase API klíče (publishable/secret) a asymetrické JWT signing keys, rotace | Rotace bez výpadku, odvolatelnost | secrets-data |
| N-30 | Denial of wallet – limity útraty serverless/AI, spend alerty | Útok na účet místo na data | infra-abuse |
| N-31 | Neuhodnutelné identifikátory a tokeny (CSPRNG); UUID ≠ autorizace | Enumerace záznamů | authz-tenancy |
| N-32 | Úniky přes `unstable_cache`/`use cache`/ISR mezi uživateli | Cizí data v cache | nextjs-api |
| N-33 | Ochrana closures v Server Actions, `server-only`, React Taint API | Únik tajemství do klienta | nextjs-api |
| N-34 | Prototype pollution, ReDoS, JSON bomb | DoS / obejití validace | nextjs-api |
| N-35 | Admin relace: kratší platnost, AAL2 vynucené přímo v RLS | MFA nejde obejít voláním API | auth, supabase |
| N-36 | Odhlášení všude po změně hesla/MFA; detekce znovupoužití refresh tokenu | Ukradená relace přežije změnu hesla | auth |
| N-37 | Skripty třetích stran (analytika, chat widget) na přihlášených stránkách, SRI | Kód třetí strany čte data z DOM | nextjs-api |
| N-38 | Žádná produkční data v dev/preview; anonymizované seedy | Únik přes slabší prostředí | secrets-data |
| N-39 | Offboarding tenanta: export + výmaz napříč DB, Storage, zálohami, integracemi | GDPR + smluvní povinnost | gdpr-legal |
| N-40 | Regresní test pro každou opravenou zranitelnost | Chyby se vracejí (zvlášť u AI generovaného kódu) | testing |
| N-41 | Pracovní stanice vývojáře a session Claude Code (šifrování disku, oddělený prohlížečový profil, žádné prod tokeny v shellu) | Vývojářský stroj je nejslabší článek | ai-agents |
| N-42 | Bezpečné předání a převzetí přístupů (klient vlastní účty, ne vývojář) | Lock-in a osiřelé přístupy | release-gate |
