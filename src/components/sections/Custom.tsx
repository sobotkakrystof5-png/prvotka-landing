import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { ContactLink } from "@/components/layout/ContactLink";
import { RichText } from "@/components/motifs/RichText";
import { SampleBadge } from "@/components/motifs/SampleBadge";
import { CustomShowcase, type ShowcaseItem } from "./CustomShowcase";
import { AccessDemo, FeeDemo, FormatsDemo, MappingDemo, ProgramDemo } from "./CustomDemos";

/**
 * (06) Postaveno pro vaši firmu. Individuální přístup: postup ve čtyřech
 * krocích a pět bodů z briefu
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
      <CustomShowcase
        intro={
          <>
            <SectionTitle id="na-miru" className="max-w-[15ch]">
              <RichText text={custom.title} />
            </SectionTitle>
            <p className="type-lead mt-6 max-w-[40ch]">{custom.lead}</p>
            <div className="mt-8 max-w-[40ch]">
              <p className="type-label text-ink">{custom.stepsTitle}</p>
              <ol className="mt-3 border-t border-rule">
                {custom.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-rule py-2.5">
                    <span className="pt-0.5 font-mono text-[0.78rem] text-accent tabular">{index + 1}</span>
                    <span className="text-[1rem] leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ContactLink variant="outline" className="mt-8">
              {cs.cta}
            </ContactLink>
          </>
        }
        items={items}
      />
    </Section>
  );
}
