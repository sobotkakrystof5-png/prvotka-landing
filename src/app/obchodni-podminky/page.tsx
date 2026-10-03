import type { Metadata } from "next";
import { cs } from "@/content/cs";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: cs.legal.terms.title,
  description: cs.legal.terms.description,
  alternates: { canonical: "/obchodni-podminky" },
  // Dokud je tu jen placeholder, stránka se neindexuje.
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalPage title={cs.legal.terms.title} />;
}
