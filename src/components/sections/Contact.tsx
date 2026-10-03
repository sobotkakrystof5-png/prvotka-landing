import { isPlaceholder, site } from "@/config/site";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { Placeholder, withPlaceholders } from "@/components/motifs/Placeholder";
import { RichText } from "@/components/motifs/RichText";
import { ContactFormLoader } from "./ContactFormLoader";

/**
 * (10) Kontakt. Vlevo kontaktní údaje a „Co můžete čekat“ jen z ověřených
 * faktů, vpravo formulář na `paper-deep`. Na mobilu je formulář hned pod nadpisem.
 */
export function Contact() {
  const { contact } = cs;

  const expect = [
    site.responseTime ? contact.expect.responseTime(site.responseTime) : null,
    site.introCallLength ? contact.expect.introCall(site.introCallLength) : null,
    contact.expect.honest,
  ].filter((item): item is string => item !== null);

  return (
    <Section
      id="kontakt"
      spacing="pt-20 pb-24 lg:pt-28 lg:pb-32"
      className="border-t-[3px] border-double border-rule"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-10">
        <div className="lg:col-span-5 lg:row-start-1">
          <SectionTitle id="kontakt" className="max-w-[16ch]">
            {contact.title}
          </SectionTitle>
          <p className="mt-6 max-w-[42ch] text-[1.08rem] leading-relaxed text-ink-muted">
            <RichText text={contact.lead} />
          </p>
        </div>

        <div className="rounded-sm border border-rule bg-paper-deep p-5 sm:p-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <ContactFormLoader />
          <noscript>
            <p className="mt-4 text-[0.95rem]">
              {contact.form.noscript} {withPlaceholders(site.email)}
            </p>
          </noscript>
        </div>

        <div className="lg:col-span-5 lg:row-start-2">
          <div className="flex items-center gap-4">
            <div
              role="img"
              aria-label={contact.photoAlt}
              className="flex size-16 shrink-0 items-center justify-center rounded-sm border border-dashed border-field-border bg-paper-deep"
            >
              <span className="font-mono text-[0.62rem] text-warn-ink">{contact.photoPlaceholder}</span>
            </div>
            <div>
              <p className="font-heading text-[1.3rem] leading-tight">{site.ceo}</p>
              <p className="type-label mt-1">{contact.role}</p>
            </div>
          </div>

          <dl className="mt-6 border-t border-rule text-[0.95rem]">
            <ContactRow label={contact.emailLabel}>
              {isPlaceholder(site.email) ? (
                <Placeholder>{site.email}</Placeholder>
              ) : (
                <a href={`mailto:${site.email}`} className="link">
                  {site.email}
                </a>
              )}
            </ContactRow>
            <ContactRow label={contact.phoneLabel}>
              {isPlaceholder(site.phone) ? (
                <Placeholder>{site.phone}</Placeholder>
              ) : (
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link">
                  {site.phone}
                </a>
              )}
            </ContactRow>
            <ContactRow label={contact.icoLabel}>{withPlaceholders(site.ico)}</ContactRow>
          </dl>

          <div className="mt-10">
            <h3 className="type-label mb-3 text-ink">{contact.expect.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {expect.map((item) => (
                <li key={item} className="flex gap-3 text-[0.98rem]">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
      <dt className="type-label pt-0.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
