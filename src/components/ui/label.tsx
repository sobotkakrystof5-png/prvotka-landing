"use client"

import * as React from "react"
import { cn } from "cn"
import { Label as LabelPrimitive } from "radix-ui"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-baseline gap-2 text-[0.95rem] leading-snug font-semibold text-ink select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-55",
        className
      )}
      {...props}
    />
  )
}

export { Label }
