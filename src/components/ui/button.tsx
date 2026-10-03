import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Tlačítko (shadcn/ui jako kostra, vizuál přes tokeny projektu).
 * Ostré rohy podle jednoho rádiusu, hover posouvá šipku, ne celé tlačítko.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border font-sans font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent active:translate-y-px disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-accent bg-accent text-sheet hover:border-accent-strong hover:bg-accent-strong",
        outline:
          "border-ink/80 bg-transparent text-ink hover:border-ink hover:bg-sheet",
        ghost: "border-transparent bg-transparent text-ink hover:bg-paper-deep",
        link: "border-transparent px-0 text-ink underline decoration-accent/60 underline-offset-4 hover:decoration-accent",
      },
      size: {
        default: "h-11 px-5 text-[0.95rem]",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
