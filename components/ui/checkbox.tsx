'use client'

import * as React from 'react'
import {
  Checkbox as SdkCheckbox,
  CheckboxIndicator as SdkCheckboxIndicator,
} from '@ui-sdk/react/checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof SdkCheckbox>,
  React.ComponentPropsWithoutRef<typeof SdkCheckbox>
>(({ className, ...props }, ref) => (
  <SdkCheckbox
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-checked:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <SdkCheckboxIndicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </SdkCheckboxIndicator>
  </SdkCheckbox>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
