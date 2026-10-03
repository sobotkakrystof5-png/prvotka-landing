"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_FIRST_FIELD_ID, isModifiedClick, scrollToSection } from "@/lib/navigate";
import { cn } from "@/lib/utils";

/**
 * Odkaz na kontaktní formulář: plynulý posun na `#kontakt` a fokus na první pole.
 * Bez JavaScriptu funguje jako obyčejná kotva. Šipka se při najetí posune.
 */
export function ContactLink({
  children,
  variant = "default",
  size = "default",
  className,
  onNavigate,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  /** Volitelně: místo vlastního posunu jen předá cíl (mobilní menu se nejdřív zavře). */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/#kontakt"
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(event) => {
        if (isModifiedClick(event)) return;
        if (onNavigate) {
          event.preventDefault();
          onNavigate();
          return;
        }
        if (scrollToSection("kontakt", CONTACT_FIRST_FIELD_ID)) event.preventDefault();
      }}
    >
      {children}
      <ArrowRightIcon
        aria-hidden="true"
        strokeWidth={1.75}
        className="transition-transform duration-200 group-hover/button:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}
