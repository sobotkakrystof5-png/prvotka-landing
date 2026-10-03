import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IsdocxIcon, PdfIcon } from "@/components/motifs/DocIcons";
import { LogoFull, LogoMark } from "@/components/motifs/LogoMark";
import { Mark } from "@/components/motifs/Mark";
import { Placeholder } from "@/components/motifs/Placeholder";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { Stamp } from "@/components/motifs/Stamp";

/**
 * Interní stránka designového systému pro schválení Fáze 2.
 * `noindex`, zakázaná v robots.txt, mimo sitemapu. Před nasazením (Fáze 9)
 * odstranit nebo zneplatnit.
 */
export const metadata: Metadata = {
  title: "Styleguide (interní)",
  robots: { index: false, follow: false },
};

const COLORS = [
  { token: "paper", hex: "#F6F1E8", className: "bg-paper", note: "hlavní podklad" },
  { token: "paper-deep", hex: "#EDE5D8", className: "bg-paper-deep", note: "střídání sekcí, formulář" },
  { token: "sheet", hex: "#FCFAF5", className: "bg-sheet", note: "NOVÝ: papír dokumentu, pole formuláře" },
  { token: "ink", hex: "#1A1916", className: "bg-ink", note: "text: 15,6 : 1 na paper" },
  { token: "ink-muted", hex: "#5E5A52", className: "bg-ink-muted", note: "6,1 : 1 na paper, 5,5 : 1 na paper-deep" },
  { token: "rule", hex: "#D9CFBF", className: "bg-rule", note: "linkování, jen dekorativní" },
  { token: "accent", hex: "#1F5C4A", className: "bg-accent", note: "6,9 : 1 na paper, bílá na accent 7,8 : 1" },
  { token: "accent-soft", hex: "#DCE8E1", className: "bg-accent-soft", note: "podtržení Mark, razítko" },
  { token: "warn", hex: "#B4651E", className: "bg-warn", note: "jen ikona a okraj podezřelé hodnoty (3,9 : 1)" },
  { token: "warn-ink", hex: "#8F4E14", className: "bg-warn-ink", note: "NOVÝ: text varování, 5,7 : 1 na paper" },
  { token: "warn-soft", hex: "#F5E6D6", className: "bg-warn-soft", note: "NOVÝ: podklad upozornění" },
  { token: "field-border", hex: "#857C6C", className: "bg-field-border", note: "NOVÝ: okraj polí, 3,7 : 1 na paper, 3,3 : 1 na paper-deep" },
  { token: "error", hex: "#A33A2B", className: "bg-error", note: "chyby formuláře, 5,8 : 1 na paper" },
];

export default function StyleguidePage() {
  return (
    <div className="wrap flex flex-col gap-20 py-16">
      <header>
        <p className="type-label text-accent">Interní, noindex</p>
        <h1 className="type-h2 mt-3">Designový systém, návrh Fáze 2</h1>
        <p className="mt-4 max-w-[62ch] text-ink-muted">
          Ke schválení: barvy, písma, logo a motivy. Kontrasty jsou spočítané podle WCAG 2.2 (vzorec relativní
          luminance), před nasazením je ověří ještě Lighthouse a axe.
        </p>
      </header>

      <section aria-labelledby="sg-colors">
        <h2 id="sg-colors" className="type-h3">Barvy</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map((color) => (
            <li key={color.token} className="flex gap-4 rounded-sm border border-rule bg-sheet p-3">
              <span className={`size-14 shrink-0 rounded-sm border border-rule ${color.className}`} />
              <span>
                <span className="block font-mono text-[0.85rem] text-ink">{color.token}</span>
                <span className="block font-mono text-[0.75rem] text-ink-muted">{color.hex}</span>
                <span className="mt-1 block text-[0.82rem] leading-snug text-ink-muted">{color.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-type">
        <h2 id="sg-type" className="type-h3">Typografie</h2>
        <div className="mt-6 flex flex-col gap-6 border-t border-rule pt-6">
          <p className="type-label">Nadpisy: Newsreader (serif, optické velikosti, latin-ext)</p>
          <p className="type-display">Faktury, které už nikdo nepřepisuje</p>
          <p className="type-h2">Příliš žluťoučký kůň úpěl ďábelské ódy</p>
          <p className="type-h3">Účetní řádky ř, ů, ě, š, č, ž, ý, á, í, é, ú, ď, ť, ň</p>
          <p className="type-label mt-4">Text: Manrope</p>
          <p className="max-w-[62ch]">
            Klienti posílají faktury v PDF, jako sken nebo fotku z telefonu. Účetní program chce ISDOC nebo XML, takže se
            faktura přepisuje ručně. Příliš žluťoučký kůň úpěl ďábelské ódy.
          </p>
          <p className="type-label mt-4">Čísla a záznam: JetBrains Mono, tabulkové číslice</p>
          <p className="font-mono text-[0.95rem] tabular">IČO 12345678 · VS 2026045 · Σ 12 480,00 Kč · &lt;isdoc:Invoice&gt;</p>
        </div>
      </section>

      <section aria-labelledby="sg-motifs">
        <h2 id="sg-motifs" className="type-h3">Motivy</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="ledger h-48 rounded-sm border border-rule bg-paper p-5">
            <p className="type-label">Účetní linkování (krok 2rem)</p>
          </div>
          <div className="relative h-48 rounded-sm border border-rule bg-paper">
            <div className="ledger-margin absolute inset-y-0 left-0 w-32 p-5">
              <p className="type-label">
                <span className="text-ink">(02)</span>
                <br />
                Proč to řešit
              </p>
            </div>
            <p className="absolute top-5 left-40 type-label">Okraj účetní knihy s číslem sekce</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 rounded-sm border border-rule bg-sheet p-5">
            <Stamp>Součty sedí</Stamp>
            <Stamp>DPH ověřeno</Stamp>
            <Stamp tone="warn">Zkontrolovat</Stamp>
            <span className="type-label">Razítko, na stránce max 3×</span>
          </div>
          <div className="rounded-sm border border-rule bg-sheet p-5">
            <p className="type-h3">
              Faktura se <Mark>přepisuje ručně</Mark>.
            </p>
            <p className="type-label mt-3">Mark: podtržení se jednou dotáhne při vstupu do viewportu</p>
          </div>
          <div className="flex items-center gap-6 rounded-sm border border-rule bg-sheet p-5">
            <PdfIcon className="size-14 text-ink" />
            <IsdocxIcon className="size-14 text-accent" />
            <LogoMark className="h-12 text-ink" />
            <LogoMark compact className="h-5 text-ink" />
            <LogoFull className="h-10 text-ink" />
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-sm border border-rule bg-sheet p-5">
            <SampleBadge />
            <Placeholder>[PLACEHOLDER]</Placeholder>
            <span className="font-mono text-[0.78rem] text-figure">Σ 12 480,00 Kč (čísla v pozadí)</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="sg-components">
        <h2 id="sg-components" className="type-h3">Komponenty</h2>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button size="lg">Domluvit hovor</Button>
          <Button>Odeslat poptávku</Button>
          <Button variant="outline">Kontaktní formulář</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Odkaz</Button>
          <Button disabled>Neaktivní</Button>
        </div>
        <div className="mt-8 grid max-w-xl gap-4 rounded-sm bg-paper-deep p-6">
          <label htmlFor="sg-input" className="text-[0.95rem] font-semibold">
            Pole formuláře
          </label>
          <Input id="sg-input" placeholder="Jana Ukázková" />
          <Input aria-invalid placeholder="Chybné pole" aria-label="Chybné pole" />
          <p className="text-[0.85rem] text-error">Chybová hláška formuláře.</p>
          <p className="rounded-sm border border-warn bg-warn-soft px-3 py-2 text-[0.9rem] text-warn-ink">
            Součet položek nesedí s celkovou částkou. Zkontrolujte před importem.
          </p>
        </div>
        <p className="mt-6 max-w-[62ch] text-[0.9rem] text-ink-muted">
          Rádius: jeden pro celý web (3 px), papír má ostré rohy. Jediná výjimka jsou kulaté úchyty posuvníku a porty
          ve workflow.
        </p>
      </section>
    </div>
  );
}
