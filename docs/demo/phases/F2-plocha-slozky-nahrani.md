# F2: Plocha, složky, nahrání

Závisí na: F1. Spuštění: `/phase F2`.

## Cíl
Dvoudílná plocha (vlevo vstup, vpravo místo pro výsledek), složky klientů kanceláře, nahrávání jednotlivých i hromadných souborů do soukromého úložiště a fronta úloh. Vytěžení zatím jen jako zástupná úloha.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 0, 3, 4, 8, 10, 13. `memory.md` D-002, D-006, D-010, D-012.

**Potřebuješ od uživatele (Q-001):** rozhodnutí o úložišti (R2, nebo Vercel Blob) a přístupové údaje do `.env.local`. Bez toho jde dokončit jen paměťový adaptér a testy.

## Úkoly
1. **Schéma:** `clients` (složky), `invoices` (viz BRIEF bod 4), `jobs`. Migrace.
2. **Skutečná implementace `StorageAdapter`** podle rozhodnutí. CORS jen pro náš web. Objekty pod předponou `workspaces/<workspace_id>/...`. Soukromé, jen podepsané odkazy s krátkou platností.
3. **Rozložení plochy** podle BRIEF bodu 13 a ukázky aplikace na prvotka.cz:
   - vlevo navigace složek klientů s počty, zóna pro nahrání a seznam faktur ve složce s razítkovými stavy,
   - vpravo zatím jen prázdný stav ("Vyberte fakturu"),
   - vybraná faktura v adrese (`/demo/app?faktura=<id>`),
   - mobil: části za sebe, po výběru faktury výsledek s tlačítkem Zpět.
4. **Složky klientů:** vytvoření, přejmenování, výběr. Faktura vždy patří do složky.
5. **Nahrání:** přetažení myší, výběr souboru, fotka z mobilu (`<input type="file" accept="image/*,application/pdf" capture="environment">`).
6. **Hromadný výběr:** klient vybere až 30 souborů, v prohlížeči se zobrazí celý seznam (název, velikost, počet stran u PDF, pokud je to levné zjistit). Označí, které se mají zpracovat, nejvýše tolik, kolik zbývá pokusů. Zbylé se na server vůbec neposílají a zobrazí se jako "V plné verzi se zpracují všechny".
7. **Přímé nahrání do úložiště** z prohlížeče přes podepsaný odkaz (kvůli limitu velikosti požadavku na Vercelu). Zmenšení fotek v prohlížeči na zhruba 300 KB (delší strana kolem 2000 px). HEIC převést v prohlížeči, pokud to jde, jinak srozumitelná hláška.
8. **Registrace faktury po nahrání:** server ověří typ podle obsahu (prvních bajtů v úložišti, ne podle přípony), velikost (nejvýše 10 MB), počet stran PDF (nejvýše 15), spočítá `sha256`, zjistí duplicitu a teprve potom faktuře dá stav `queued`. Neplatný soubor se z úložiště smaže.
9. **Serverová kontrola kvóty při registraci:** nejvýše 4 nezmařené faktury na plochu (rezervace, D-012). Souběžné požadavky nesmí kvótu obejít (transakce nebo zámek). Tuto základní kontrolu doplní F6 o stavy vyčerpání a odpočet.
10. **Fronta:** tabulka `jobs`, zpracování po 3 současně, zástupná úloha, která faktuře nastaví `needs_review`. Klient vidí průběh ("2 z 4 hotovo", obnovování každé 2 s). Poškozený soubor se označí `failed` a ostatní pokračují.

## Mimo rozsah
Skutečné vytěžení (F3), pravá část s údaji a ISDOC (F4, F5), vyčerpání a odpočet (F6), mazání (F8).

## Hotovo, když
- Klient založí složku, nahraje PDF a fotku z mobilu a vidí je v seznamu.
- Z dávky 30 PDF jde vybrat nejvýše 4, ostatní se nenahrají, v úložišti jsou jen vybrané.
- Neplatný nebo podvržený soubor (např. `.pdf` s jiným obsahem) se odmítne.
- Nahrání z cizí plochy nebo cizího `workspace_id` neprojde (test).
- Souběžné nahrání nepřekročí 4 faktury (test).
- Mobilní rozložení funguje.

## Kontroly
Žádný název souboru nebo obsah v logu. Podepsané odkazy nejsou trvalé. Texty `humanize-text-cs`.

## Možné dělení na sessions
1. Schéma, adaptér, složky, rozložení plochy.
2. Nahrávání (jednotlivé i hromadné), validace, fronta, mobil.
