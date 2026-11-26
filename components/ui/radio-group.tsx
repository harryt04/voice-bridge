'use client'

import * as React from 'react'
import {
  Radio as SdkRadio,
  RadioGroup as SdkRadioGroup,
  RadioIndicator as SdkRadioIndicator,
} from '@ui-sdk/react/radio'
import { Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof SdkRadioGroup>,
  React.ComponentPropsWithoutRef<typeof SdkRadioGroup>
>(({ className, ...props }, ref) => {
  return (
    <SdkRadioGroup
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof SdkRadio>,
  React.ComponentPropsWithoutRef<typeof SdkRadio>
>(({ className, ...props }, ref) => {
  return (
    <SdkRadio
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SdkRadioIndicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </SdkRadioIndicator>
    </SdkRadio>
  )
})
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
