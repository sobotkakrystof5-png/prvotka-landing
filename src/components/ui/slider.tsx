"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

/**
 * Posuvník kalkulačky. Stopa je tenká linka jako v účetní knize, úchyt je
 * jediný kulatý prvek na stránce (zdokumentovaná výjimka z jednoho rádiusu).
 * `thumbLabel` dává úchytu přístupný název.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  thumbValueText,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  thumbLabel?: string
  thumbValueText?: string
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex h-6 w-full touch-none items-center select-none data-disabled:opacity-55",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-[3px] w-full grow overflow-hidden bg-rule"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-accent"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabel}
          aria-valuetext={thumbValueText}
          className="relative block size-5 shrink-0 rounded-full border-2 border-accent bg-sheet shadow-paper transition-transform after:absolute after:-inset-2.5 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent active:scale-110"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
