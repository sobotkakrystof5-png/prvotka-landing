# F10: Dokončení a předání

Závisí na: F9. Spuštění: `/phase F10`.

## Cíl
Dotáhnout kvalitu (přístupnost, mobil, texty, end-to-end test), doplnit právní stránky, nasadit demo na produkční adresu, odkázat na něj z prvotka.cz a projít předávací checklist.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 0, 12, 13, 15, 17.

**Potřebuješ od uživatele (Q-006, Q-008):** checklist "web předání" a případně "web externí oprava" (v účtu nenalezeny), stránku Ochrana osobních údajů (doplní uživatel nebo právník), potvrzení doby uchování leadu (Q-003) a ověření, že test exportu v POHODĚ proběhl (F5).

## Úkoly
1. **End-to-end test celé cesty** (Playwright): brána, registrace, složka, hromadný výběr 30 PDF a zpracování 4, kontrola, úprava ručně i asistentem, ISDOC, vyčerpání, banner, vypršení a návrat.
2. **Přístupnost:** kontrast alespoň WCAG AA, ovládání klávesnicí, popisky polí, srozumitelné chybové hlášky, jeden H1 na stránku.
3. **Mobil a tablet:** celá cesta na telefonu, včetně fotky faktury a skládání částí plochy.
4. **Výkon:** základní Core Web Vitals, žádný zbytečný blokující skript, pevné poměry stran.
5. **Texty:** všechny české texty (formuláře, hlášky, e-maily, banner, asistent) projdi skillem `humanize-text-cs` a výsledek porovnej s tónem prvotka.cz.
6. **Právní stránky:** odkaz a místo pro Ochranu osobních údajů a Obchodní podmínky. Právní text nepiš sám, doplní uživatel. Věta pod formulářem odpovídá skutečnému chování mazání.
7. **Odkaz z prvotka.cz:** tlačítko "Vyzkoušet demo" vede na `/demo`. Případně varianta pro odkaz s `?ref=` do e-mailů (jak ho Kryštof generuje, zapiš do README).
8. **Nasazení:** produkční prostředí dema (samostatné proměnné a větev databáze), ověření cronu, e-mailů, Turnstile a úložiště. Ověř, že ostrá aplikace a její databáze nejsou dotčeny.
9. **Předávací checklist:** projdi uživatelův checklist bod po bodu, každý bod odškrtni nebo zapiš jako otevřený. Pokud checklist není k dispozici, vytvoř jednoduchý seznam z tohoto briefu a nech ho uživatele schválit.
10. **Dokumentace:** krátké `README` provozu (jak spustit, proměnné prostředí, jak vypnout demo, jak ručně smazat plochu, jak číst oznámení).
11. **Úklid paměti:** Aktuální stav v `memory.md` do čistého stavu "ve provozu", otevřené body a poznámka k HSTS preload.

## Mimo rozsah
Nové funkce. Nezbytné opravy z testů ano, nápady ne.

## Hotovo, když
- End-to-end test projde na počítači i v emulaci telefonu.
- Kontrola přístupnosti a výkonu nemá kritické nálezy.
- Předávací checklist je projitý a uživatel ho potvrdil.
- Odkaz z prvotka.cz funguje.
- Poznámka k provozu (README) existuje.

## Kontroly
Žádná chyba v konzoli. Žádné tajné hodnoty. Celá cesta klienta ověřená na produkčním prostředí.

## Možné dělení na sessions
1. Testy, přístupnost, mobil, výkon, texty.
2. Právní stránky, nasazení, odkaz z webu, checklist, README.
