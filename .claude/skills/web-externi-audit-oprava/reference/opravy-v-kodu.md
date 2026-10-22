# Ověřené opravy v kódu (Next.js 16, App Router, Vercel)

Ukázky z projektu Prvotka. Upravit podle struktury daného repa, ne kopírovat slepě.

## JSON-LD: kontakt a profily
```ts
const provider = {
  "@type": "ProfessionalService",
  // ...
  email: site.email,
  telephone: site.phone,
  contactPoint: { "@type": "ContactPoint", contactType: "sales", email: site.email, telephone: site.phone, availableLanguage: "cs" },
  ...(site.profiles.length > 0 ? { sameAs: site.profiles } : {}),
};
```
`site.profiles: readonly string[] = []` v konfiguraci. Adresa se nepřidává, pokud ji majitel nezveřejňuje. Serializace `JSON.stringify(...).replace(/</g, "\\u003c")`, skript s nonce.

## llms.txt
`src/app/llms.txt/route.ts`: `export const dynamic = "force-static"`, `GET()` vrací `text/plain; charset=utf-8` s hlavičkou `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`. Obsah: `# Název`, `> popis`, 1–2 věty o produktu, kontakt, odkazy na stránky. Jen existující data. Cena, slib o datech a tým pouze tehdy, když je web smí tvrdit (přepínače v konfiguraci).

## Cache statiky v `next.config.ts`
```ts
const publicAssetCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
async headers() {
  return [
    { source: "/:path*", headers: securityHeaders },
    { source: "/brands/:path*", headers: publicAssetCache },
    { source: "/ceo.jpg", headers: publicAssetCache },
  ];
}
```
HTML s CSP nonce se necachuje (`no-store`), to je správně. Neslučuj to s bezpečnostními hlavičkami do jednoho pravidla `/:path*`.

## Radix Slider: `aria-valuenow` v SSR
V `components/ui/slider.tsx` na `SliderPrimitive.Thumb` přidej `aria-valuenow={_values[index]}`. Radix zapisuje hodnotu až po hydrataci a W3C validátor hlásí chybějící atribut. Props se u Thumbu spreadují později, takže vlastní hodnota přepíše Radixovu.

## Odložení těžkého formuláře
```tsx
"use client";
const ContactForm = dynamic(() => import("./ContactForm").then(m => m.ContactForm), { ssr: false, loading: () => placeholder });
export function ContactFormLoader() {
  const anchor = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = anchor.current;
    if (!node || typeof IntersectionObserver === "undefined") { setNear(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some(x => x.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: "800px 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={anchor}>{near ? <ContactForm /> : placeholder}</div>;
}
```
`placeholder` má stejnou minimální výšku jako formulář (bez CLS) a obsahuje informaci o zpracování osobních údajů s odkazem. Ověření: počet JS požadavků po načtení vs. po scrollu na `#kontakt` (puppeteer-core + Chrome, bez Playwrightu).

## Lokální ověření bez Playwrightu
```bash
npm run build && npm run start -- -p 3111 &
cd /tmp && npm i puppeteer-core && node test.mjs   # executablePath: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
npx --yes lighthouse@12 http://localhost:3111/ --only-categories=performance,accessibility --chrome-flags="--headless=new --no-sandbox"
```
`NO_NAVSTART` u Lighthouse je náhodná chyba, spusť znovu.
