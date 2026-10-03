import type { Metadata } from "next";
import { cs } from "@/content/cs";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: cs.legal.privacy.title,
  description: cs.legal.privacy.description,
  alternates: { canonical: "/ochrana-osobnich-udaju" },
  // Dokud je tu jen placeholder, stránka se neindexuje.
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalPage title={cs.legal.privacy.title} />;
}
