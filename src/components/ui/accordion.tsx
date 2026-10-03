"use client"

import * as React from "react"
import { cn } from "cn"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { PlusIcon } from "lucide-react"

/**
 * FAQ akordeon: otázky sedí na účetních linkách, plus se otočí na křížek.
 */
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col border-t border-rule", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-rule", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-start justify-between gap-6 py-5 text-left font-heading text-[1.25rem] leading-snug text-ink transition-colors outline-none hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-[1.4rem]",
          className
        )}
        {...props}
      >
        {children}
        <PlusIcon
          aria-hidden="true"
          strokeWidth={1.5}
          className="mt-1 size-5 shrink-0 text-accent transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-45 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      // Odpovědi zůstávají v HTML i zavřené (SEO). S `forceMount` Radix nenastaví
      // `hidden`, proto zavřený stav skrývá CSS.
      forceMount
      className="overflow-hidden data-[state=closed]:hidden data-open:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("max-w-[62ch] pb-6 text-ink-muted", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
