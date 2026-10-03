import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { ContactLink } from "@/components/layout/ContactLink";
import { RichText } from "@/components/motifs/RichText";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { CustomShowcase, type ShowcaseItem } from "./CustomShowcase";
import { ProcessSteps } from "./ProcessSteps";
import { AccessDemo, FeeDemo, FormatsDemo, MappingDemo, ProgramDemo } from "./CustomDemos";

/**
 * (06) Postaveno pro vaši firmu. Individuální přístup: postup ve čtyřech
 * krocích (zvýrazněný pás přes celou šířku pod nadpisem) a pět bodů z briefu
 * („Proč na míru“), každý s malou živou ukázkou. Bod o datech se přidá
 * jen při rozhodnutém `site.dataStaysOnPremise`.
 */
const DEMOS: Record<string, React.ComponentType> = {
  program: ProgramDemo,
  mapping: MappingDemo,
  formats: FormatsDemo,
  access: AccessDemo,
  fee: FeeDemo,
};

export function Custom() {
  const { custom } = cs;

  const items: ShowcaseItem[] = custom.items.map((item) => {
    const Demo = DEMOS[item.key];
    return {
      key: item.key,
      // Klíč i tady: prvky v poli props putují ze serverové komponenty do klientské
      // a React je pak kontroluje jako položky seznamu.
      content: (
        <div key={item.key} className="flex flex-col gap-6">
          <div>
            <h3 className="type-h3">{item.title}</h3>
            <p className="mt-3 max-w-[48ch] text-ink-muted">
              <RichText text={item.text} />
            </p>
          </div>
          {Demo ? (
            <div className="relative max-w-[30rem] rounded-sm border border-rule bg-sheet p-4 shadow-paper sm:p-5">
              <SampleBadge className="absolute -top-2.5 right-3" />
              <Demo />
            </div>
          ) : null}
        </div>
      ),
    };
  });

  if (custom.data) {
    items.push({
      key: custom.data.key,
      content: (
        <div key={custom.data.key}>
          <h3 className="type-h3">{custom.data.title}</h3>
          <p className="mt-3 max-w-[52ch] text-ink-muted">
            <RichText text={custom.data.text} />
          </p>
        </div>
      ),
    });
  }

  return (
    <Section id="na-miru" spacing="pt-20 pb-24 lg:pt-32 lg:pb-32" className="border-t-[3px] border-double border-rule">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <SectionTitle id="na-miru" className="max-w-[15ch] lg:col-span-5">
          <RichText text={custom.title} />
        </SectionTitle>
        <p className="type-lead max-w-[46ch] lg:col-span-7">{custom.lead}</p>
      </div>

      {/* Postup spolupráce: samostatný pás přes celou šířku, čitelný na první pohled. */}
      <div className="mt-12 mb-16 rounded-sm border border-rule border-t-[3px] border-t-accent bg-sheet p-6 shadow-paper sm:p-8 lg:mt-14 lg:mb-20 lg:p-10">
        <h3 className="type-h3">{custom.stepsTitle}</h3>
        <ProcessSteps />
      </div>

      <CustomShowcase
        intro={
          <ContactLink variant="outline" className="hidden lg:inline-flex">
            {cs.cta}
          </ContactLink>
        }
        items={items}
      />
      <ContactLink variant="outline" className="mt-4 lg:hidden">
        {cs.cta}
      </ContactLink>
    </Section>
  );
}
