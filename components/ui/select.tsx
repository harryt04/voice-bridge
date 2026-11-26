'use client'

import * as React from 'react'
import {
  Select as SdkSelect,
  SelectContent as SdkSelectContent,
  SelectGroup as SdkSelectGroup,
  SelectGroupLabel as SdkSelectGroupLabel,
  SelectItem as SdkSelectItem,
  SelectItemIndicator as SdkSelectItemIndicator,
  SelectItemText as SdkSelectItemText,
  SelectList as SdkSelectList,
  SelectSeparator as SdkSelectSeparator,
  SelectTrigger as SdkSelectTrigger,
  SelectValue as SdkSelectValue,
} from '@ui-sdk/react/select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

function Select({
  onValueChange,
  ...props
}: Omit<
  Extract<
    React.ComponentProps<typeof SdkSelect<string, false>>,
    { multiple?: false }
  >,
  'onValueChange'
> & { onValueChange?: (value: string) => void }) {
  return (
    <SdkSelect<string, false>
      {...props}
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value)
      }}
    />
  )
}

const SelectGroup = SdkSelectGroup

const SelectValue = SdkSelectValue

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SdkSelectTrigger>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkSelectTrigger>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <SdkSelectTrigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}

    <ChevronDown className="h-4 w-4 opacity-50" />
  </SdkSelectTrigger>
))
SelectTrigger.displayName = 'SelectTrigger'

function ScrollButton({
  direction,
  ...props
}: React.ComponentProps<'button'> & { direction: number }) {
  const Icon = direction < 0 ? ChevronUp : ChevronDown
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={direction < 0 ? 'Scroll up' : 'Scroll down'}
      {...props}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(event) => {
        const list = event.currentTarget.parentElement?.querySelector(
          '[data-slot="select-list"]',
        )
        list?.scrollBy({ top: direction * 64 })
      }}
    >
      <Icon className="size-4" />
    </button>
  )
}
const SelectScrollUpButton = (props: React.ComponentProps<'button'>) => (
  <ScrollButton direction={-1} {...props} />
)
const SelectScrollDownButton = (props: React.ComponentProps<'button'>) => (
  <ScrollButton direction={1} {...props} />
)
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SdkSelectContent>,
  (Omit<React.ComponentPropsWithoutRef<typeof SdkSelectContent>, 'children'> & {
    children?: React.ReactNode
  }) & { position?: 'popper' | 'item-aligned' }
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SdkSelectContent
    ref={ref}
    className={cn(
      'z-50 max-h-96 min-w-(--anchor-width) overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      position === 'popper' &&
        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
      className,
    )}
    alignItemWithTrigger={position === 'item-aligned'}
    container={typeof document === 'undefined' ? null : document.body}
    {...props}
  >
    <SdkSelectList
      className={cn(
        'max-h-80 overflow-y-auto p-1',
        position === 'popper' && 'w-full',
      )}
    >
      {children}
    </SdkSelectList>
  </SdkSelectContent>
))
SelectContent.displayName = 'SelectContent'

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SdkSelectGroupLabel>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SdkSelectGroupLabel>,
    'children'
  > & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <SdkSelectGroupLabel
    ref={ref}
    className={cn('py-1.5 pr-2 pl-8 text-sm font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = 'SelectLabel'

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SdkSelectItem>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkSelectItem>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <SdkSelectItem
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SdkSelectItemIndicator>
        <Check className="h-4 w-4" />
      </SdkSelectItemIndicator>
    </span>

    <SdkSelectItemText>{children}</SdkSelectItemText>
  </SdkSelectItem>
))
SelectItem.displayName = 'SelectItem'

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SdkSelectSeparator>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SdkSelectSeparator>,
    'children'
  > & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <SdkSelectSeparator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
SelectSeparator.displayName = 'SelectSeparator'

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
