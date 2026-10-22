---
name: vizeon-sec-files
description: Bezpečná práce se soubory a dokumenty – upload a download přes Supabase Storage, privátní buckety, signed URL, ověření skutečného typu souboru, skenování malwaru, izolované zpracování PDF/OCR/obrázků, generování faktur a PDF z HTML (SSRF), exporty CSV/XLSX (formula injection), importy (XXE, zip bomby), path traversal, dočasné soubory, audit stažení a zálohy souborů. Použij u každé funkce, která přijímá, ukládá, generuje, zobrazuje nebo exportuje soubor. Pokrývá sekci H a #86–#87.
---

# Soubory, dokumenty, faktury, exporty (sekce H)

U účetních a fakturačních aplikací jsou soubory nejcitlivější aktivum (faktury, smlouvy, výpisy, mzdy, doklady totožnosti) a nejčastější cesta pro malware a SSRF.

## P0 pravidla
1. **Citlivé soubory jen v privátních bucketech** (#88). Veřejný bucket ignoruje RLS.
2. **Cestu souboru určuje server**: `<org_id>/<entita>/<uuid>.<ext>`. Nikdy uživatelský název souboru v cestě (#96).
3. **Každé stažení = `authorize()` na serveru + krátká signed URL (60–300 s)** nebo streamování přes Route Handler (#89, #90). Signed URL nejde předčasně odvolat (N-09).
4. **DB je zdroj pravdy:** tabulka `documents(id, org_id, path, mime, size, sha256, uploaded_by, scanned_status)`. Přístup se ověřuje přes řádek v DB (RLS) a Storage politika je druhá vrstva (#91).
5. **Nedůvěryhodné soubory se nezpracovávají v hlavním aplikačním procesu** (#95).

## Upload – postup
1. Server Action ověří `authorize(orgId, 'document.upload')`, zkontroluje deklarovaný typ a velikost, vytvoří záznam `documents` (status `pending`) a vydá **signed upload URL** (`createSignedUploadUrl`) na cestu, kterou určil sám.
2. Bucket má `file_size_limit` a `allowed_mime_types` (#92) – vzor v `vizeon-sec-supabase/references/storage-policies.sql`.
3. Po nahrání (Storage webhook / následná akce) **ověř skutečný typ podle magic bytes** (`file-type` knihovna), ne podle přípony ani `Content-Type` (#93). Nesoulad → smazat, `rejected`.
4. Spočítej SHA-256, ulož do DB (integrita, deduplikace, důkaz).
5. Riziková přílohy (od externích stran, e-mailové importy, kancelářské dokumenty) → **skenování malwaru** (ClamAV v izolovaném workeru, nebo služba typu VirusTotal jen pokud to dovoluje DPA – data nesmí odejít bez posouzení) (#94). Do dokončení skenu je soubor `pending` a nelze ho stáhnout jinými uživateli.
6. Zakázané typy pro upload v CRM: `text/html`, `image/svg+xml` (XSS), spustitelné soubory, makro dokumenty (`.docm`, `.xlsm`) – pokud nejsou výslovně potřeba.

## Download a zobrazení
- Odpověď s `Content-Disposition: attachment; filename*=UTF-8''<escapovaný název>` a `X-Content-Type-Options: nosniff`; PDF zobrazované inline jen ze stejného originu s CSP.
- Uživatelem nahrané soubory nikdy nezobrazuj na hlavní doméně aplikace jako HTML.
- `Cache-Control: private, no-store` u citlivých dokumentů; signed URL neposílej do analytiky ani logů (#117).
- Audit: kdo, kdy, jaký dokument, z jaké IP (#98). Hromadná stahování → alert (`vizeon-sec-ops-resilience`, #192).

## Zpracování nedůvěryhodných dokumentů (#95, #87)
- OCR, PDF parsing, konverze obrázků, náhledy: samostatná služba/worker (Supabase Edge Function, Vercel Function s izolací, kontejner) **bez přístupu k secret key a DB** – dostane jen soubor a vrátí výsledek.
- Limity: velikost, počet stran, rozlišení obrázku (decompression bomb), časový limit, paměť.
- XML (ISDOC, XML výpisy, datové zprávy): parser s vypnutými externími entitami a DTD (XXE). V Node např. `fast-xml-parser` (nezpracovává DTD entity) – ověř konfiguraci; nikdy `libxmljs` s `noent: true`.
- ZIP/archivy: limit počtu souborů, celkové velikosti po rozbalení, zákaz `../` a absolutních cest (zip slip), žádné symlinky.
- Obrázky: přegeneruj (sharp) a odstraň EXIF (poloha, metadata).

## Generování PDF faktur (N-16)
- Preferuj knihovny, které nevykreslují HTML (`@react-pdf/renderer`, `pdf-lib`).
- Pokud headless Chrome/Puppeteer renderuje HTML s uživatelskými daty: escapuj všechna data, zakaž síťové požadavky (`page.setRequestInterception` → povol jen `data:` a vlastní fonty), zakaž JavaScript, `file://` URL, běž v izolovaném prostředí bez přístupu k interní síti a metadatům. Jinak útočník přes `<iframe src="file:///etc/passwd">` nebo `http://169.254.169.254` v poli „název firmy“ čte server.
- Hotové PDF ukládej jako neměnný objekt (bez UPDATE politiky), verze = nový soubor.

## Exporty CSV/XLSX (#86, #199)
- Formula injection: hodnoty začínající `=`, `+`, `-`, `@`, tabulátorem nebo `\r` prefixuj apostrofem:
```ts
export function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
```
- Export je citlivá operace: vlastní oprávnění (`org.exportAll` jen owner), re-autentizace, limit četnosti a objemu, audit, ideálně asynchronně se stažením přes krátkou signed URL a automatickým smazáním souboru (#97).
- Exportuj jen sloupce, které role smí vidět (field-level).

## Path traversal a názvy (#96)
- Původní název souboru ukládej jen jako metadata (sanitizovaný, max 255 znaků), nikdy jako cestu.
- Pokud někde pracuješ s FS (`/tmp`), použij `path.join(base, uuid)` a ověř `resolved.startsWith(base + path.sep)`.

## Dočasné soubory (#97)
- `os.tmpdir()` + náhodný název (`crypto.randomUUID()`), práva `0o600`, smazání ve `finally`.
- Dočasné exporty ve Storage: samostatný bucket s automatickým mazáním (cron job po 24 h).

## Zálohy souborů (#99, #207)
**Supabase databázové zálohy NEOBSAHUJÍ objekty ve Storage.** Postup záloh Storage a test obnovy v `vizeon-sec-ops-resilience`. Ověř, že záznamy `documents` a objekty jdou obnovit ve vzájemně konzistentním stavu (porovnání `sha256`).

## Negativní testy
- [ ] Uživatel firmy B nestáhne dokument firmy A přes: přímou cestu Storage, signed URL endpoint s cizím `documentId`, export, e-mailový odkaz.
- [ ] Upload `.html`, `.svg`, `.exe` přejmenovaného na `.pdf` → odmítnut.
- [ ] Soubor nad limit → odmítnut na bucketu i v aplikaci.
- [ ] Název `../../x` → bezpečně uložen pod UUID.
- [ ] CSV s `=HYPERLINK(...)` → exportováno jako text.
- [ ] Faktura s názvem firmy `<iframe src="http://169.254.169.254/">` → v PDF jako text, žádný požadavek ven.
- [ ] XML s externí entitou → nezpracováno.

## Kontroly: #86–#99, #117, #199, N-09, N-16
