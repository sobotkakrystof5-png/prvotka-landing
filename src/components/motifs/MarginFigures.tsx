import { FileIcon, IsdocxIcon, PdfIcon } from "./DocIcons";

/**
 * Čísla, pojmy a obrysy souborů z faktur po stranách stránky, tónem v tónu.
 * Skoro neviditelné, parallax max 8 px přes CSS scroll-driven animace
 * (`animation-timeline: view()`), bez JavaScriptu. Prohlížeč bez podpory
 * nebo s `prefers-reduced-motion` ukáže čísla staticky.
 * Vlevo sedí v okraji účetní knihy (od 1024 px), vpravo jen krátké údaje
 * ve volném okraji (od 1440 px). Na mobilu se nezobrazí. Čistě dekorativní.
 */
export interface Figure {
  /** Text údaje, u souboru štítek formátu (PDF, ISDOCX, SKEN). */
  text: string;
  /** `file` = obrys dokumentu se štítkem místo textu. */
  kind?: "text" | "file";
  /** Svislá pozice v procentech výšky rodiče. */
  top: number;
  side: "left" | "right";
}

function FigureText({ figure, far }: { figure: Figure; far: boolean }) {
  return (
    <span
      data-depth={far ? "far" : "near"}
      // Štítek souboru bez světlého podkladu, jinak by na papíře svítil.
      className="figure-parallax absolute font-mono text-[0.78rem] whitespace-nowrap text-figure select-none [&_rect]:fill-none"
      style={{ top: `${figure.top}%` }}
    >
      {figure.kind === "file" ? <FigureFile label={figure.text} /> : figure.text}
    </span>
  );
}

function FigureFile({ label }: { label: string }) {
  if (label === "PDF") return <PdfIcon className="size-11" />;
  if (label === "ISDOCX") return <IsdocxIcon className="size-11" />;
  return <FileIcon label={label} className="size-11" />;
}

export function MarginFigures({ figures }: { figures: Figure[] }) {
  const left = figures.filter((figure) => figure.side === "left");
  const right = figures.filter((figure) => figure.side === "right");

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 left-[calc(max(0px,(100vw-1264px)/2)+var(--gutter))] hidden w-[7.5rem] lg:block">
        {left.map((figure, index) => (
          <FigureText key={figure.text} figure={figure} far={index % 2 === 1} />
        ))}
      </div>
      <div className="absolute inset-y-0 right-[max(0.75rem,calc((100vw-1264px)/2-5.5rem))] hidden w-[5rem] min-[1440px]:block">
        {right.map((figure, index) => (
          <FigureText key={figure.text} figure={figure} far={index % 2 === 0} />
        ))}
      </div>
    </div>
  );
}
