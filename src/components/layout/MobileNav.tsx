"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { NAV_SECTIONS, sectionNumber } from "@/lib/sections";
import { CONTACT_FIRST_FIELD_ID, isModifiedClick, scrollToSection } from "@/lib/navigate";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ContactLink } from "./ContactLink";

/**
 * Mobilní menu. Po výběru odkazu se menu nejdřív zavře (uvolní se zámek
 * scrollu) a teprve pak se stránka posune a fokus přejde na cíl. Jinak by
 * Radix vrátil fokus na hamburger a stránka by skočila zpátky nahoru.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pending = useRef<{ id: string; focusId?: string } | null>(null);

  const go = (id: string, focusId?: string) => {
    pending.current = { id, focusId };
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex size-11 items-center justify-center rounded-sm text-ink transition-colors hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden">
        <MenuIcon strokeWidth={1.5} className="size-6" aria-hidden="true" />
        <span className="visually-hidden">{cs.nav.openMenu}</span>
      </SheetTrigger>
      <SheetContent
        closeLabel={cs.nav.closeMenu}
        onCloseAutoFocus={(event) => {
          const target = pending.current;
          if (!target) return;
          event.preventDefault();
          pending.current = null;
          requestAnimationFrame(() => {
            if (!scrollToSection(target.id, target.focusId)) {
              router.push(`/#${target.id}`);
            }
          });
        }}
      >
        <div className="flex h-[72px] items-center px-6">
          <SheetTitle>{cs.nav.menuTitle}</SheetTitle>
          <SheetDescription>{cs.nav.menuDescription}</SheetDescription>
        </div>
        <nav aria-label={cs.nav.label} className="flex-1 overflow-y-auto px-6">
          <ul className="flex flex-col">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <Link
                  href={`/#${id}`}
                  className="flex h-16 items-baseline gap-4 border-b border-rule text-ink transition-colors hover:text-accent"
                  onClick={(event) => {
                    if (isModifiedClick(event)) return;
                    event.preventDefault();
                    go(id);
                  }}
                >
                  <span className="type-label w-9 shrink-0 pt-6">{sectionNumber(id)}</span>
                  <span className="font-heading text-[1.6rem] leading-[4rem]">{cs.nav.links[id]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-rule bg-paper p-6">
          <ContactLink className="w-full" size="lg" onNavigate={() => go("kontakt", CONTACT_FIRST_FIELD_ID)}>
            {cs.nav.cta}
          </ContactLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
