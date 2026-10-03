"use client";

import dynamic from "next/dynamic";
import { cs } from "@/content/cs";

/**
 * Formulář (React Hook Form + Zod) se stáhne až po hydrataci stránky,
 * takže nesoutěží s obsahem nad ohybem o přenos. Sekce je hluboko pod
 * ohybem, záměna zástupného bloku za formulář nezpůsobí viditelný posun.
 */
const ContactForm = dynamic(() => import("./ContactForm").then((module) => module.ContactForm), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[54rem] items-start sm:min-h-[44rem]" aria-busy="true">
      <p className="type-label">{cs.contact.form.loading}</p>
    </div>
  ),
});

export function ContactFormLoader() {
  return <ContactForm />;
}
