import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { InvoiceDemo } from "@/components/demo/InvoiceDemo";
import { Workflow } from "@/components/demo/Workflow";

/**
 * (04) Jak to funguje. Signature sekce: nahoře workflow celého toku,
 * pod ním demo na konkrétních fakturách. Obě ukázky záměrně přesahují
 * přes okraj účetní knihy na plnou šířku.
 */
// Pozadí přes okraj, aby dvojitá linka neprobíhala přes popisky ukázek.
const BLEED = "relative bg-paper lg:-ml-[calc(var(--margin-col)+3rem)] xl:-ml-[calc(var(--margin-col)+4rem)]";

export function HowItWorks() {
  const { howItWorks } = cs;
  return (
    <Section
      id="jak-to-funguje"
      spacing="pt-20 pb-24 lg:pt-28 lg:pb-32"
      className="border-t-[3px] border-double border-rule"
    >
      <SectionTitle id="jak-to-funguje" className="max-w-[18ch]">
        {howItWorks.title}
      </SectionTitle>
      <p className="type-lead mt-6 max-w-[52ch]">{howItWorks.lead}</p>

      <div className={`mt-14 ${BLEED}`}>
        <Workflow />
      </div>

      <div className={`mt-20 lg:mt-24 ${BLEED}`}>
        <InvoiceDemo />
      </div>
    </Section>
  );
}
