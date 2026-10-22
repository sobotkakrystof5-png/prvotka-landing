import Link from "next/link";
import { demoCs } from "@/content/demo";
import { buttonVariants } from "@/components/ui/button";
import { LedgerPage } from "./LedgerPage";

/** Obrazovka při `DEMO_ENABLED` jiném než `true`: demo se dá vypnout bez nasazení kódu. */
export function DemoDisabled() {
  const { disabled, gate } = demoCs;
  return (
    <LedgerPage margin={gate.margin} marginName={gate.marginName} titleId="demo-disabled-title">
      <h1 id="demo-disabled-title" className="type-h2 max-w-[20ch]">
        {disabled.title}
      </h1>
      <p className="mt-5 max-w-[52ch] text-ink-muted">{disabled.text}</p>
      <Link href="/#kontakt" className={buttonVariants({ className: "mt-10" })}>
        {disabled.back}
      </Link>
    </LedgerPage>
  );
}
