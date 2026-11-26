'use client'

import * as React from 'react'
import {
  Dialog as SdkDialog,
  DialogBackdrop as SdkDialogBackdrop,
  DialogClose as SdkDialogClose,
  DialogContent as SdkDialogContent,
  DialogDescription as SdkDialogDescription,
  DialogTitle as SdkDialogTitle,
  DialogTrigger as SdkDialogTrigger,
} from '@ui-sdk/react/dialog'
import { BodyPortal } from './body-portal'
import { withChild } from './with-child'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const Sheet = SdkDialog

const SheetTrigger = withChild(SdkDialogTrigger)

const SheetClose = withChild(SdkDialogClose)

const SheetPortal = BodyPortal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SdkDialogBackdrop>,
  React.ComponentPropsWithoutRef<typeof SdkDialogBackdrop>
>(({ className, ...props }, ref) => (
  <SdkDialogBackdrop
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-ending-style:animate-out data-ending-style:fade-out-0 data-open:animate-in data-open:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-open:animate-in data-ending-style:animate-out data-ending-style:duration-300 data-open:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-ending-style:slide-out-to-top data-open:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-ending-style:slide-out-to-bottom data-open:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-ending-style:slide-out-to-left data-open:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-ending-style:slide-out-to-right data-open:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SdkDialogContent>,
    VariantProps<typeof sheetVariants> {
  children?: React.ReactNode
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SdkDialogContent>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SdkDialogContent
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SdkDialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-open:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SdkDialogClose>
    </SdkDialogContent>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SdkDialogTitle>,
  React.ComponentPropsWithoutRef<typeof SdkDialogTitle>
>(({ className, ...props }, ref) => (
  <SdkDialogTitle
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SdkDialogDescription>,
  React.ComponentPropsWithoutRef<typeof SdkDialogDescription>
>(({ className, ...props }, ref) => (
  <SdkDialogDescription
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
