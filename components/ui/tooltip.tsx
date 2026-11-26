'use client'

import * as React from 'react'
import {
  Tooltip as SdkTooltip,
  TooltipContent as SdkTooltipContent,
  TooltipTrigger as SdkTooltipTrigger,
} from '@ui-sdk/react/tooltip'
import { withChild } from './with-child'

import { cn } from '@/lib/utils'

const Delay = React.createContext<number | undefined>(undefined)
function TooltipProvider({
  children,
  delayDuration,
}: {
  children: React.ReactNode
  delayDuration?: number
}) {
  return <Delay.Provider value={delayDuration}>{children}</Delay.Provider>
}

function Tooltip(props: React.ComponentProps<typeof SdkTooltip>) {
  return <SdkTooltip delay={React.useContext(Delay)} {...props} />
}

const TooltipTrigger = withChild(SdkTooltipTrigger)

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof SdkTooltipContent>,
  React.ComponentPropsWithoutRef<typeof SdkTooltipContent>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <SdkTooltipContent
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 animate-in overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md fade-in-0 zoom-in-95 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
