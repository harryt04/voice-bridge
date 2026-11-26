'use client'

import * as React from 'react'
import {
  Switch as SdkSwitch,
  SwitchThumb as SdkSwitchThumb,
} from '@ui-sdk/react/switch'

import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SdkSwitch>,
  React.ComponentPropsWithoutRef<typeof SdkSwitch>
>(({ className, ...props }, ref) => (
  <SdkSwitch
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-unchecked:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SdkSwitchThumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0',
      )}
    />
  </SdkSwitch>
))
Switch.displayName = 'Switch'

export { Switch }
