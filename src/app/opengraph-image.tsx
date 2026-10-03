import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { plainText } from "@/components/motifs/RichText";
import { MARK, WORDMARK } from "@/components/motifs/LogoMark";

/**
 * OG obrázek ve stylu webu: papír, účetní linkování, serifový nadpis.
 * Písma se načítají jako soubory s `latin-ext` (src/assets/fonts), jinak by
 * se rozbila diakritika (ř, ů, ě). Barvy jsou kopie tokenů z globals.css,
 * protože ImageResponse CSS proměnné nečte.
 */
export const alt = cs.meta.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOKENS = {
  paper: "#f6f1e8",
  ink: "#1a1916",
  inkMuted: "#5e5a52",
  rule: "#d9cfbf",
  accent: "#1f5c4a",
  accentSoft: "#dce8e1",
};

export default async function OpengraphImage() {
  const [serif, mono] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Newsreader-Display-Medium.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/JetBrainsMono-Medium.woff")),
  ]);

  const rows = cs.hero.log.rows;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: TOKENS.paper,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 47px, ${TOKENS.rule} 47px, ${TOKENS.rule} 48px)`,
          color: TOKENS.ink,
        }}
      >
        {/* Logo jako SVG (Satori nečte třídy, proto atributy). */}
        <svg width={230} height={50} viewBox="0 -1572 8606 1868" fill={TOKENS.ink} aria-label={site.name}>
          <g transform="translate(0 -1572) scale(2.631)">
            <path d={MARK.stem} />
            <path d={MARK.flap} />
            <path d={MARK.edge} />
            <path d={MARK.check} fill="none" stroke={TOKENS.ink} strokeWidth={46} />
          </g>
          <path transform="translate(1817 0)" d={WORDMARK} />
        </svg>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div style={{ fontFamily: "Newsreader", fontSize: 76, lineHeight: 1.02, letterSpacing: -2 }}>
              {plainText(cs.hero.title)}
            </div>
            <div style={{ marginTop: 28, fontSize: 26, color: TOKENS.inkMuted, fontFamily: "Newsreader" }}>
              {cs.meta.ogSubtitle}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 380,
              background: "#fcfaf5",
              border: `1px solid ${TOKENS.rule}`,
              padding: "14px 20px",
              fontFamily: "JetBrains Mono",
              fontSize: 15,
            }}
          >
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${TOKENS.rule}`,
                }}
              >
                <span>{row.label.length > 22 ? `${row.label.slice(0, 21)}…` : row.label}</span>
                <span style={{ color: "ok" in row || "final" in row ? TOKENS.accent : TOKENS.inkMuted }}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, style: "normal", weight: 500 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}
