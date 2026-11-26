'use client'

import * as React from 'react'
import { Label as SdkLabel } from '@ui-sdk/react/label'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

const Label = React.forwardRef<
  React.ElementRef<typeof SdkLabel>,
  React.ComponentPropsWithoutRef<typeof SdkLabel> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <SdkLabel ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = 'Label'

export { Label }
