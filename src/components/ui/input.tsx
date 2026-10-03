import * as React from "react"
import { cn } from "cn"

/** Pole formuláře: papír dokumentu, okraj `field-border` (kontrast ≥ 3 : 1). */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-sm border border-field-border bg-sheet px-3 py-2 text-base text-ink transition-[border-color,box-shadow] outline-none placeholder:text-ink-muted focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-error aria-invalid:shadow-[0_0_0_1px_var(--error)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
