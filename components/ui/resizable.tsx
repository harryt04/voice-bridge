'use client'

import * as React from 'react'
import { GripVertical } from 'lucide-react'
import {
  Resizable,
  ResizableHandle as SdkResizableHandle,
  ResizablePanel as SdkResizablePanel,
} from '@ui-sdk/react/resizable'

import { cn } from '@/lib/utils'

type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof Resizable>,
  'className' | 'orientation'
> & {
  className?: string
  /** shadcn name for UI SDK's `orientation`. */
  direction?: 'horizontal' | 'vertical'
}

const ResizablePanelGroup = ({
  className,
  direction = 'horizontal',
  ...props
}: ResizablePanelGroupProps) => (
  <Resizable
    data-vb-resizable-group=""
    orientation={direction}
    className={cn(
      'flex h-full w-full data-[orientation=vertical]:flex-col',
      className,
    )}
    {...props}
  />
)

const ResizablePanel = SdkResizablePanel

type ResizableHandleProps = Omit<
  React.ComponentProps<typeof SdkResizableHandle>,
  'className' | 'children'
> & {
  className?: string
  children?: React.ReactNode
  withHandle?: boolean
}

const ResizableHandle = ({
  withHandle,
  className,
  children,
  ...props
}: ResizableHandleProps) => (
  <SdkResizableHandle
    data-vb-resizable-handle=""
    className={cn(
      'relative flex w-px items-center justify-center bg-border focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full [&[data-orientation=vertical]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" aria-hidden="true" />
      </div>
    )}
    {children}
  </SdkResizableHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
