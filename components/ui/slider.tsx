'use client'

import * as React from 'react'
import {
  Slider as SdkSlider,
  SliderControl as SdkSliderControl,
  SliderIndicator as SdkSliderIndicator,
  SliderThumb as SdkSliderThumb,
  SliderTrack as SdkSliderTrack,
} from '@ui-sdk/react/slider'

import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
  React.ElementRef<typeof SdkSlider>,
  React.ComponentPropsWithoutRef<typeof SdkSlider>
>(({ className, ...props }, ref) => (
  <SdkSlider
    ref={ref}
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className,
    )}
    {...props}
  >
    <SdkSliderControl className="relative flex h-5 w-full items-center">
      <SdkSliderTrack className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SdkSliderIndicator className="absolute h-full bg-primary" />
      </SdkSliderTrack>
      <SdkSliderThumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" />
    </SdkSliderControl>
  </SdkSlider>
))
Slider.displayName = 'Slider'

export { Slider }
