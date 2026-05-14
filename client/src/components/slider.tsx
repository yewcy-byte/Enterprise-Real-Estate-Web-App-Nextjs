import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = "horizontal",
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]
  const startValue = Math.min(..._values)
  const endValue = Math.max(..._values)
  const rangeStart = ((startValue - min) / (max - min)) * 100
  const rangeSize = ((endValue - startValue) / (max - min)) * 100

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bg-primary-700 data-horizontal:inset-y-0 data-vertical:inset-x-0"
            style={
              orientation === 'vertical'
                ? {
                    bottom: `${rangeStart}%`,
                    height: `${rangeSize}%`,
                    width: '100%',
                  }
                : {
                    insetInlineStart: `${rangeStart}%`,
                    width: `${rangeSize}%`,
                    height: '100%',
                  }
            }
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-3 shrink-0 rounded-full border border-primary-700 bg-white transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-0 focus-visible:ring-0 focus-visible:outline-none active:ring-0 disabled:pointer-events-none disabled:opacity-50"
            style={{ outline: 'none', boxShadow: 'none' }}
           />
           
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
