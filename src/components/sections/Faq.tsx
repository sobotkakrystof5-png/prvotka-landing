import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { ContactLink } from "@/components/layout/ContactLink";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/**
 * (09) Časté dotazy. Odpovědi na rovinu. Otázky bez odpovědi mají
 * `published: false` a nezobrazují se (ani v `FAQPage` schématu).
 */
export const publishedFaq = cs.faq.items.filter((item) => item.published);

export function Faq() {
  const { faq } = cs;
  return (
    <Section id="faq" spacing="pt-20 pb-24 lg:pt-28 lg:pb-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <SectionTitle id="faq">{faq.title}</SectionTitle>
          <p className="mt-6 max-w-[34ch] text-ink-muted">{faq.lead}</p>
          <div className="mt-10 hidden lg:block">
            <p className="font-heading text-[1.25rem]">{faq.more}</p>
            <ContactLink variant="outline" className="mt-4">
              {cs.cta}
            </ContactLink>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible>
            {publishedFaq.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p>{withPlaceholders(item.a)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 lg:hidden">
            <p className="font-heading text-[1.25rem]">{faq.more}</p>
            <ContactLink variant="outline" className="mt-4">
              {cs.cta}
            </ContactLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
