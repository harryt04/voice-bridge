'use client'

import * as React from 'react'
import {
  Tabs as SdkTabs,
  TabsList as SdkTabsList,
  TabsPanel as SdkTabsPanel,
  TabsTab as SdkTabsTab,
} from '@ui-sdk/react/tabs'

import { cn } from '@/lib/utils'

const Tabs = SdkTabs

const TabsList = React.forwardRef<
  React.ElementRef<typeof SdkTabsList>,
  React.ComponentPropsWithoutRef<typeof SdkTabsList>
>(({ className, ...props }, ref) => (
  <SdkTabsList
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof SdkTabsTab>,
  React.ComponentPropsWithoutRef<typeof SdkTabsTab>
>(({ className, ...props }, ref) => (
  <SdkTabsTab
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-selected:bg-background data-selected:text-foreground data-selected:shadow-xs',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  React.ElementRef<typeof SdkTabsPanel>,
  React.ComponentPropsWithoutRef<typeof SdkTabsPanel>
>(({ className, ...props }, ref) => (
  <SdkTabsPanel
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
