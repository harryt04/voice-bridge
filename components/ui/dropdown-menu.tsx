'use client'

import * as React from 'react'
import {
  Menu as SdkMenu,
  MenuCheckboxItem as SdkMenuCheckboxItem,
  MenuContent as SdkMenuContent,
  MenuGroup as SdkMenuGroup,
  MenuItem as SdkMenuItem,
  MenuItemIndicator as SdkMenuItemIndicator,
  MenuRadioGroup as SdkMenuRadioGroup,
  MenuRadioItem as SdkMenuRadioItem,
  MenuSeparator as SdkMenuSeparator,
  MenuSub as SdkMenuSub,
  MenuSubContent as SdkMenuSubContent,
  MenuSubTrigger as SdkMenuSubTrigger,
  MenuTrigger as SdkMenuTrigger,
} from '@ui-sdk/react/menu'
import { BodyPortal } from './body-portal'
import { withChild } from './with-child'
import { Check, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

const DropdownMenu = SdkMenu

const DropdownMenuTrigger = withChild(SdkMenuTrigger)

const DropdownMenuGroup = SdkMenuGroup

const DropdownMenuPortal = BodyPortal

const DropdownMenuSub = SdkMenuSub

const DropdownMenuRadioGroup = SdkMenuRadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof SdkMenuSubTrigger>,
  (Omit<
    React.ComponentPropsWithoutRef<typeof SdkMenuSubTrigger>,
    'children'
  > & { children?: React.ReactNode }) & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <SdkMenuSubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent data-open:bg-accent',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </SdkMenuSubTrigger>
))
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof SdkMenuSubContent>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkMenuSubContent>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, ...props }, ref) => (
  <SdkMenuSubContent
    ref={ref}
    className={cn(
      'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof SdkMenuContent>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkMenuContent>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <BodyPortal>
    <SdkMenuContent
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </BodyPortal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof SdkMenuItem>,
  (Omit<React.ComponentPropsWithoutRef<typeof SdkMenuItem>, 'children'> & {
    children?: React.ReactNode
  }) & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <SdkMenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof SdkMenuCheckboxItem>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SdkMenuCheckboxItem>,
    'children'
  > & { children?: React.ReactNode }
>(({ className, children, checked, ...props }, ref) => (
  <SdkMenuCheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SdkMenuItemIndicator>
        <Check className="h-4 w-4" />
      </SdkMenuItemIndicator>
    </span>
    {children}
  </SdkMenuCheckboxItem>
))
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof SdkMenuRadioItem>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkMenuRadioItem>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <SdkMenuRadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SdkMenuItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </SdkMenuItemIndicator>
    </span>
    {children}
  </SdkMenuRadioItem>
))
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof SdkMenuSeparator>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkMenuSeparator>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, ...props }, ref) => (
  <SdkMenuSeparator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
