"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";
import { cs } from "@/content/cs";

/**
 * 2minutové video: klikací náhled, přehrání až po kliknutí, nikdy automaticky.
 * Self-hosted MP4 s titulky (`<track>`). Při volbě YouTube (nocookie) je nutná
 * změna CSP a zápis do `.claude/security/CSP-LOG.md`.
 */
export function VideoPlayer({ src, captionsSrc }: { src: string; captionsSrc?: string }) {
  const [playing, setPlaying] = useState(false);
  const { video } = cs.about;

  if (playing) {
    return (
      <video controls autoPlay preload="none" className="aspect-video w-full rounded-sm bg-ink" src={src}>
        {captionsSrc ? <track kind="captions" srcLang="cs" label="Čeština" src={captionsSrc} default /> : null}
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative flex aspect-video w-full items-center justify-center rounded-sm border border-rule bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
    >
      <span className="inline-flex items-center gap-3 rounded-sm bg-accent px-5 py-3 font-semibold text-sheet transition-colors group-hover:bg-accent-strong">
        <PlayIcon aria-hidden="true" strokeWidth={1.75} className="size-5" />
        {video.play}
      </span>
      <span className="absolute right-3 bottom-3 rounded-sm bg-ink/80 px-2 py-1 font-mono text-[0.75rem] text-sheet">
        {video.duration}
      </span>
    </button>
  );
}
