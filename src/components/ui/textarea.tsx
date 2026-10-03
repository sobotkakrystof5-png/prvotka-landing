import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-sm border border-field-border bg-sheet px-3 py-2.5 text-base text-ink transition-[border-color,box-shadow] outline-none placeholder:text-ink-muted focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-error aria-invalid:shadow-[0_0_0_1px_var(--error)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
