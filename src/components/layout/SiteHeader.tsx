import Link from "next/link";
import { cs } from "@/content/cs";
import { NAV_SECTIONS } from "@/lib/sections";
import { ContactLink } from "./ContactLink";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

/**
 * Navbar: logo vlevo, odkazy na sekce uprostřed, „Kontaktní formulář“ vpravo.
 * Statický (`position: static`), při scrollu neputuje s obsahem. [OVĚŘIT]
 * Pod 1024 px hamburger se Sheetem zprava.
 */
export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-rule bg-paper">
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav aria-label={cs.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <Link
                  href={`/#${id}`}
                  className="relative py-2 text-[0.92rem] font-medium text-ink-muted transition-colors after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:text-ink hover:after:scale-x-100 motion-reduce:after:transition-none"
                >
                  {cs.nav.links[id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ContactLink size="sm" className="hidden sm:inline-flex">
            {cs.nav.cta}
          </ContactLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
