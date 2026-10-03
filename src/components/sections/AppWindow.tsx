"use client";

import { useRef, useState } from "react";
import { CheckIcon, CopyIcon, PaperclipIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";
import { useOneShotTimeline } from "@/lib/useOneShotTimeline";
import { FileIcon, PdfIcon } from "@/components/motifs/DocIcons";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { ReplayButton } from "@/components/motifs/ReplayButton";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { dropTime, endTime, rowStatusAt, type RowOutcome, type RowStatus } from "./appWindowTimeline";

/**
 * Okno aplikace ve stylu Docker Desktop (sekce Proč to řešit). Ukazuje
 * produkt, který kancelář dostane: do okna dopadnou faktury v různých
 * formátech a každý řádek předvede jednu skutečnou funkci z briefu
 * (vytěžení, převzetí přílohy ISDOC, kontrola součtů, ochrana proti
 * dvojímu zpracování). Běží jednou (do 5 s), pak se dá klikat: menu
 * filtruje seznam, řádek otevře vytěžené údaje. Data jsou vymyšlená.
 */

const { app } = cs.proc;
type Row = (typeof app.rows)[number];
type Filter = (typeof app.nav)[number]["key"];

const OUTCOMES = app.rows.map((row) => row.outcome as RowOutcome);
const END = endTime(OUTCOMES) + 0.2;
/** Jak dlouho soubor „padá“ do okna, než se z něj stane řádek. */
const FALL = 0.35;

const FINAL: readonly RowStatus[] = ["ready", "attachment", "warning", "duplicate"];

function matchesFilter(filter: Filter, status: RowStatus): boolean {
  if (status === "hidden") return false;
  switch (filter) {
    case "review":
      return status === "warning";
    case "export":
      return status === "ready" || status === "attachment";
    case "archive":
      return status === "ready" || status === "attachment" || status === "warning";
    default:
      return true;
  }
}

export function AppWindow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { time, status, replay, reduce } = useOneShotTimeline(rootRef, END, 0.3);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const statuses = app.rows.map((row, index) => rowStatusAt(index, row.outcome as RowOutcome, time));
  const finished = time >= END;
  // Po doběhnutí se sám otevře řádek s upozorněním, dokud návštěvník nevybere jiný.
  const shownId = selected ?? (finished ? "e" : null);
  const shown = app.rows.find((row) => row.id === shownId) ?? null;
  const shownStatus = shown ? statuses[app.rows.indexOf(shown)] : null;

  const visible = app.rows
    .map((row, index) => ({ row, status: statuses[index], index }))
    .filter(({ status: rowStatus }) => matchesFilter(filter, rowStatus));

  const falling = app.rows
    .map((row, index) => ({ row, index, progress: (time - (dropTime(index) - FALL)) / FALL }))
    .filter(({ progress }) => progress > 0 && progress < 1);

  const replayAll = () => {
    setSelected(null);
    setFilter("all");
    replay();
  };

  return (
    <div ref={rootRef}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="type-h3">{app.label}</h3>
        <SampleBadge>{app.sample}</SampleBadge>
      </div>

      <div className="overflow-hidden rounded-[6px] border border-field-border bg-sheet shadow-paper">
        {/* Titulní lišta okna */}
        <div className="flex items-center gap-3 border-b border-rule bg-paper-deep px-4 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rule" />
            <span className="size-2.5 rounded-full bg-rule" />
            <span className="size-2.5 rounded-full bg-rule" />
          </span>
          <span className="flex min-w-0 items-center gap-2 text-[0.9rem] font-semibold">
            {withPlaceholders(app.title)}
          </span>
        </div>

        <div className="grid md:grid-cols-[10.5rem_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,1fr)_17rem]">
          {/* Postranní menu (na mobilu čipy) */}
          <nav aria-label={app.label} className="border-b border-rule p-3 md:border-r md:border-b-0 md:py-4">
            <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
              {app.nav.map((item) => {
                const count = statuses.filter((rowStatus) => matchesFilter(item.key, rowStatus)).length;
                const active = filter === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(item.key)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 text-left text-[0.88rem] transition-colors",
                        active ? "bg-accent-soft font-semibold text-accent-strong" : "text-ink hover:bg-paper-deep",
                        "max-md:border max-md:border-rule",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "min-w-5 rounded-sm px-1 text-center font-mono text-[0.72rem] tabular",
                          item.key === "review" && count > 0 ? "bg-warn-soft text-warn-ink" : "text-ink-muted",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Seznam faktur */}
          <div className="min-w-0 p-3 sm:p-4">
            <div aria-hidden="true" className="flex h-9 items-center gap-2 rounded-sm border border-rule bg-paper px-2.5 text-[0.85rem] text-ink-muted">
              <SearchIcon strokeWidth={1.75} className="size-4 shrink-0" />
              <span className="truncate">{app.search}</span>
            </div>

            {/* Místo, kam soubory dopadají */}
            <div
              aria-hidden="true"
              className={cn(
                "relative mt-3 flex h-12 items-center justify-center overflow-hidden rounded-sm border border-dashed text-[0.8rem] transition-colors",
                falling.length > 0 ? "border-accent bg-accent-soft/40 text-accent" : "border-field-border text-ink-muted",
              )}
            >
              {app.drop}
              {falling.map(({ row, index, progress }) => (
                <span
                  key={row.id}
                  className="absolute top-1 text-ink"
                  style={{
                    left: `${12 + index * 14}%`,
                    opacity: Math.min(1, progress * 2),
                    transform: `translateY(${(progress - 1) * 40}px) rotate(${(1 - progress) * (index % 2 ? 8 : -8)}deg)`,
                  }}
                >
                  <RowIcon row={row} className="size-8" />
                </span>
              ))}
            </div>

            <div className="mt-3 hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_9.5rem] gap-3 px-2.5 pb-1.5 sm:grid">
              <span className="type-label">{app.columns.file}</span>
              <span className="type-label">{app.columns.supplier}</span>
              <span className="type-label">{app.columns.status}</span>
            </div>

            <ul aria-label={app.columns.file} className="flex min-h-[22rem] flex-col gap-1 border-t border-rule pt-1.5 sm:min-h-[17.5rem]">
              {visible.map(({ row, status: rowStatus }) => (
                <li key={row.id} className="app-row-in">
                  <button
                    type="button"
                    aria-pressed={shownId === row.id}
                    aria-controls="app-window-detail"
                    onClick={() => setSelected(row.id)}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-sm border-l-2 px-2.5 py-2 text-left transition-colors sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_9.5rem]",
                      shownId === row.id ? "border-accent bg-accent-soft/50" : "border-transparent hover:bg-paper",
                    )}
                  >
                    <span className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
                      <RowIcon row={row} className="size-6 shrink-0 text-ink-muted" />
                      <span className="truncate font-mono text-[0.8rem]">{row.file}</span>
                    </span>
                    <span className="col-start-1 row-start-2 truncate pl-8 text-[0.8rem] text-ink-muted sm:col-start-auto sm:row-start-auto sm:pl-0 sm:text-[0.88rem] sm:text-ink">
                      {row.supplier}
                    </span>
                    <span className="col-start-2 row-start-2 sm:col-start-auto sm:row-start-auto">
                      <StatusPill status={rowStatus} />
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 && status === "done" ? (
                <li className="px-2.5 py-6 text-[0.9rem] text-ink-muted">{app.emptyFilter}</li>
              ) : null}
            </ul>
          </div>

          {/* Detail faktury */}
          <div
            id="app-window-detail"
            className="min-h-[15rem] border-t border-rule bg-paper p-4 md:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l"
          >
            <p className="type-label text-ink">{app.detailTitle}</p>
            {shown && shownStatus && FINAL.includes(shownStatus) ? (
              <div className="mt-3">
                <p className="truncate font-mono text-[0.8rem] text-ink-muted">{shown.file}</p>
                <p className="mt-1 font-heading text-[1.2rem] leading-tight">{shown.supplier}</p>
                <dl className="mt-3 flex flex-col gap-1 font-mono text-[0.78rem] tabular">
                  {shown.fields.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-rule-faint py-1">
                      <dt className="text-ink-muted">{label}</dt>
                      <dd
                        className={cn(
                          "text-right",
                          shownStatus === "warning" && label === "Celkem" ? "font-semibold text-warn-ink" : "text-ink",
                        )}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <DetailNote status={shownStatus} />
              </div>
            ) : (
              <p className="mt-3 max-w-[32ch] text-[0.9rem] leading-relaxed text-ink-muted">{app.empty}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        {reduce ? null : (
          <ReplayButton onClick={replayAll} disabled={status !== "done"}>
            {app.replay}
          </ReplayButton>
        )}
      </div>

      <p aria-live="polite" className="visually-hidden">
        {status === "running" ? app.live.running : status === "done" && finished ? app.live.done : ""}
      </p>
    </div>
  );
}

function RowIcon({ row, className }: { row: Row; className?: string }) {
  if (row.kind === "PDF") return <PdfIcon className={className} />;
  const label = row.kind === "Fotka" ? "JPG" : row.kind === "Sken" ? "SKEN" : "ISDOC";
  return <FileIcon label={label} className={className} />;
}

function StatusPill({ status }: { status: RowStatus }) {
  const label = status === "hidden" ? "" : cs.proc.app.status[status];
  const working = status === "extracting" || status === "checking";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[0.76rem] font-semibold whitespace-nowrap",
        status === "uploaded" && "border border-rule text-ink-muted",
        working && "bg-paper-deep text-ink",
        (status === "ready" || status === "attachment") && "bg-accent-soft text-accent-strong",
        status === "warning" && "bg-warn-soft text-warn-ink",
        status === "duplicate" && "bg-paper-deep text-ink-muted",
      )}
    >
      {working ? <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent" /> : null}
      {status === "ready" ? <CheckIcon aria-hidden="true" strokeWidth={2.25} className="size-3.5" /> : null}
      {status === "attachment" ? <PaperclipIcon aria-hidden="true" strokeWidth={2} className="size-3.5" /> : null}
      {status === "warning" ? <TriangleAlertIcon aria-hidden="true" strokeWidth={2} className="size-3.5" /> : null}
      {status === "duplicate" ? <CopyIcon aria-hidden="true" strokeWidth={2} className="size-3.5" /> : null}
      {label}
    </span>
  );
}

function DetailNote({ status }: { status: RowStatus }) {
  const { notes } = cs.proc.app;
  if (status === "warning") {
    return (
      <p className="mt-4 flex gap-2 rounded-sm border border-warn bg-warn-soft p-2.5 text-[0.85rem] leading-snug text-warn-ink">
        <TriangleAlertIcon aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
        {notes.warning}
      </p>
    );
  }
  const text = status === "attachment" ? notes.attachment : status === "duplicate" ? notes.duplicate : notes.ready;
  return (
    <p className={cn("mt-4 text-[0.85rem] leading-snug", status === "duplicate" ? "text-ink-muted" : "text-accent-strong")}>
      {text}
    </p>
  );
}
