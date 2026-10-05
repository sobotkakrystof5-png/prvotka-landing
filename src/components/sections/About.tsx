import Image from "next/image";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { BrandMarquee } from "./BrandMarquee";
import { VideoPlayer } from "./VideoPlayer";

/**
 * (08) Kdo za tím stojí. Stránka vedená zakladatelem (princip Ben AI):
 * fotka, příběh v první osobě, video a pás vlastních značek.
 * Fotka je skutečná, video je zatím označený placeholder s pevným poměrem stran.
 */
export function About() {
  const { about } = cs;
  return (
    <>
      <Section id="kdo-za-tim-stoji" tone="deep" spacing="pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            {/* Fotka CEO: pevný aspect-ratio, žádný layout shift */}
            <div className="relative aspect-[4/5] w-full max-w-[22rem] overflow-hidden rounded-sm border border-field-border bg-paper">
              <Image
                src="/ceo.jpg"
                alt={about.photoAlt}
                fill
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 22rem, 90vw"
                className="object-cover object-top"
              />
            </div>
            <p className="mt-4 font-heading text-[1.35rem] leading-tight">{site.ceo}</p>
            <p className="type-label mt-1">{about.role}</p>
          </div>

          <div className="lg:col-span-8">
            <SectionTitle id="kdo-za-tim-stoji" className="max-w-[18ch]">
              {about.title}
            </SectionTitle>
            <div className="mt-8 flex max-w-[58ch] flex-col gap-5 text-[1.12rem] leading-relaxed">
              {about.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {about.team && <p className="text-ink-muted">{about.team}</p>}
            </div>

            <div className="mt-12 max-w-[44rem]">
              {site.videoSrc ? (
                <VideoPlayer src={site.videoSrc} />
              ) : (
                <div className="ledger flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-field-border bg-paper text-center [--ledger-step:1.75rem]">
                  <p className="font-heading text-[1.5rem]">{about.video.placeholder}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
      <div className="bg-paper-deep">
        <BrandMarquee />
      </div>
    </>
  );
}
