import { redirect } from "next/navigation";
import { demoCs } from "@/content/demo";
import { getSignedInWorkspace } from "@/lib/demo/auth/session";
import { isDemoEnabled } from "@/lib/demo/env";
import { DemoDisabled } from "@/components/demo-app/DemoDisabled";
import { LedgerPage } from "@/components/demo-app/LedgerPage";

/** Pracovní plocha: vlevo vstup, vpravo výsledek (D-010). Jen s platnou session, obsah od F2. */
export default async function DemoWorkspacePage() {
  if (!isDemoEnabled()) return <DemoDisabled />;

  const workspace = await getSignedInWorkspace();
  if (!workspace) redirect("/demo");
  if (!workspace.open) redirect("/demo?stav=vyprselo");

  const { workspace: texts } = demoCs;
  return (
    <LedgerPage margin={texts.margin} marginName={texts.marginName} titleId="demo-workspace-title">
      <h1 id="demo-workspace-title" className="type-h3">
        {texts.title}
      </h1>
      <p className="type-lead mt-4 max-w-[52ch]">{texts.greeting}</p>
      <p className="type-label mt-6 text-warn-ink">{texts.placeholder}</p>
    </LedgerPage>
  );
}
