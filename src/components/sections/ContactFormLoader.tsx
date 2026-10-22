"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cs } from "@/content/cs";

const placeholder = (
  <div className="flex min-h-[54rem] items-start sm:min-h-[44rem]" aria-busy="true">
    <div>
      <p className="type-label">{cs.contact.form.loading}</p>
      <p className="mt-4 max-w-[52ch] text-[0.85rem] leading-snug text-ink-muted">
        {cs.contact.form.privacyNotice}{" "}
        <Link href="/ochrana-osobnich-udaju" className="link">
          {cs.contact.form.privacyLink}
        </Link>
        .
      </p>
    </div>
  </div>
);

/**
 * Formulář (React Hook Form + Zod, zhruba 100 kB) se stáhne až ve chvíli,
 * kdy se sekce Kontakt blíží k oknu prohlížeče, ne při prvním načtení stránky.
 * Zástupný blok má stejnou výšku jako formulář, takže záměna neposune obsah.
 */
const ContactForm = dynamic(() => import("./ContactForm").then((module) => module.ContactForm), {
  ssr: false,
  loading: () => placeholder,
});

export function ContactFormLoader() {
  const anchor = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = anchor.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={anchor}>{near ? <ContactForm /> : placeholder}</div>;
}
