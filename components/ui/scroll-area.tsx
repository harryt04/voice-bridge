'use client'

import * as React from 'react'
import {
  ScrollArea as SdkScrollArea,
  ScrollAreaContent as SdkScrollAreaContent,
  ScrollAreaCorner as SdkScrollAreaCorner,
  ScrollAreaScrollbar as SdkScrollAreaScrollbar,
  ScrollAreaThumb as SdkScrollAreaThumb,
  ScrollAreaViewport as SdkScrollAreaViewport,
} from '@ui-sdk/react/scroll-area'

import { cn } from '@/lib/utils'

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof SdkScrollArea>,
  React.ComponentPropsWithoutRef<typeof SdkScrollArea>
>(({ className, children, ...props }, ref) => (
  <SdkScrollArea
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <SdkScrollAreaViewport className="h-full w-full rounded-[inherit]">
      <SdkScrollAreaContent>{children}</SdkScrollAreaContent>
    </SdkScrollAreaViewport>
    <ScrollBar />
    <SdkScrollAreaCorner />
  </SdkScrollArea>
))
ScrollArea.displayName = 'ScrollArea'

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof SdkScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof SdkScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <SdkScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none transition-colors select-none',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-px',
      className,
    )}
    {...props}
  >
    <SdkScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </SdkScrollAreaScrollbar>
))
ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }
