# Písma

Všechna písma jsou pod licencí SIL Open Font License 1.1 (https://openfontlicense.org).

| Soubor | Písmo | Použití | Zdroj |
|---|---|---|---|
| `Newsreader-opsz-400.woff2` | Newsreader, váha 400, osa `opsz` 6–72 | nadpisy na webu (`next/font/local`) | Google Fonts CSS API, `family=Newsreader:opsz,wght@6..72,400` + `text=` (ASCII, Latin-1, čeština a další latin-ext znaky, typografické uvozovky a pomlčky), 2026-10-02 |
| `Manrope-400-700.woff2` | Manrope, variabilní váhy 400–700 | text webu | Google Fonts CSS API, `family=Manrope:wght@400..700` + stejné `text=`, 2026-10-02 |
| `JetBrainsMono-400-600.woff2` | JetBrains Mono, variabilní váhy 400–600 | štítky, čísla, záznam zpracování | Google Fonts CSS API, `family=JetBrains+Mono:wght@400..600` + stejné `text=`, 2026-10-02 |
| `Newsreader-Display-Medium.woff` | Newsreader 500, opsz 72 | jen OG obrázek (`opengraph-image.tsx`) | Google Fonts CSS API (WOFF pro Satori), 2026-10-02 |
| `JetBrainsMono-Medium.woff` | JetBrains Mono 500 | jen OG obrázek | Google Fonts CSS API (WOFF pro Satori), 2026-10-02 |

Web načítá písma přes `next/font/local` (self-hosting, za běhu žádný požadavek na Google, `font-src 'self'`).

Když na web přibude znak mimo podmnožinu (např. jiný jazyk), stáhnout soubor znovu s rozšířeným `text=`.
