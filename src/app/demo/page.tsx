import { demoCs } from "@/content/demo";
import { isDemoEnabled } from "@/lib/demo/env";
import { DemoDisabled } from "@/components/demo-app/DemoDisabled";
import { LedgerPage } from "@/components/demo-app/LedgerPage";

/** Brána dema. Formulář (e-mail, telefon, Turnstile) přijde ve F1. */
export default function DemoGatePage() {
  if (!isDemoEnabled()) return <DemoDisabled />;

  const { gate } = demoCs;
  return (
    <LedgerPage margin={gate.margin} marginName={gate.marginName} titleId="demo-gate-title">
      <h1 id="demo-gate-title" className="type-h2 max-w-[20ch]">
        {gate.title}
        <span className="caret" aria-hidden="true">
          _
        </span>
      </h1>
      <p className="type-label mt-8 text-warn-ink">{gate.placeholder}</p>
    </LedgerPage>
  );
}
