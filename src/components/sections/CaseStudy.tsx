import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";

/**
 * (07) Případová studie. Při `site.caseStudy === null` se sekce nevykreslí
 * a odkaz na ni nikde není. Čísla jen změřená, citace jen se souhlasem.
 */
export function CaseStudy() {
  const study = site.caseStudy;
  if (!study) return null;
  const { caseStudy } = cs;

  return (
    <Section id="pripadova-studie">
      <SectionTitle id="pripadova-studie">
        {caseStudy.title}: {study.client}
      </SectionTitle>
      <dl className="mt-10 grid gap-8 md:grid-cols-3">
        {[
          [caseStudy.before, study.before],
          [caseStudy.after, study.after],
          [caseStudy.result, study.result],
        ].map(([label, value]) => (
          <div key={label} className="border-t border-rule pt-4">
            <dt className="type-label">{label}</dt>
            <dd className="mt-2 text-[1.05rem]">{value}</dd>
          </div>
        ))}
      </dl>
      {study.quote ? (
        <figure className="mt-12 max-w-[60ch]">
          <blockquote className="font-heading text-[1.6rem] leading-snug">„{study.quote.text}“</blockquote>
          <figcaption className="mt-4 text-ink-muted">
            {study.quote.author}, {study.quote.role}
          </figcaption>
        </figure>
      ) : null}
    </Section>
  );
}
