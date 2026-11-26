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
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const Dialog = SdkDialog

const DialogTrigger = withChild(SdkDialogTrigger)

const DialogPortal = BodyPortal

const DialogClose = withChild(SdkDialogClose)

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof SdkDialogBackdrop>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkDialogBackdrop>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, ...props }, ref) => (
  <SdkDialogBackdrop
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-ending-style:animate-out data-ending-style:fade-out-0 data-open:animate-in data-open:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

const DialogContent = React.forwardRef<
  React.ElementRef<typeof SdkDialogContent>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkDialogContent>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <SdkDialogContent
      ref={ref}
      className={cn(
        'fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-ending-style:slide-out-to-left-1/2 data-ending-style:slide-out-to-top-[48%] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-left-1/2 data-open:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      <SdkDialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-open:bg-accent data-open:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SdkDialogClose>
    </SdkDialogContent>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
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
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof SdkDialogTitle>,
  Omit<React.ComponentPropsWithoutRef<typeof SdkDialogTitle>, 'children'> & {
    children?: React.ReactNode
  }
>(({ className, ...props }, ref) => (
  <SdkDialogTitle
    ref={ref}
    className={cn(
      'text-lg leading-none font-semibold tracking-tight',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof SdkDialogDescription>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SdkDialogDescription>,
    'children'
  > & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <SdkDialogDescription
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
