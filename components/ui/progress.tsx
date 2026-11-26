'use client'

import * as React from 'react'
import {
  Progress as SdkProgress,
  ProgressIndicator as SdkProgressIndicator,
} from '@ui-sdk/react/progress'

import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof SdkProgress>,
  React.ComponentPropsWithoutRef<typeof SdkProgress>
>(({ className, value, ...props }, ref) => (
  <SdkProgress
    ref={ref}
    value={value}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className,
    )}
    {...props}
  >
    <SdkProgressIndicator className="h-full bg-primary transition-all" />
  </SdkProgress>
))
Progress.displayName = 'Progress'

export { Progress }
