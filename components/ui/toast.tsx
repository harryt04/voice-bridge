'use client'

import * as React from 'react'
import * as ToastPrimitives from '@ui-sdk/react/toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastProvider = React.Fragment

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastRegion>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.ToastRegion>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.ToastRegion
    ref={ref}
    className={cn(
      'fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-swiping:translate-x-(--toast-swipe-x) data-swiping:translate-y-(--toast-swipe-y) data-swiping:transition-none data-open:animate-in data-ending-style:animate-out data-ending-style:fade-out-80 data-ending-style:slide-out-to-right-full data-open:slide-in-from-top-full data-open:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Toast>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Toast> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Toast
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = 'Toast'

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastAction>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.ToastAction>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.ToastAction
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive hover:group-[.destructive]:text-destructive-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden focus:group-[.destructive]:ring-destructive disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = 'ToastAction'

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastClose>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.ToastClose>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.ToastClose
    ref={ref}
    className={cn(
      'absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground hover:group-[.destructive]:text-red-50 focus:opacity-100 focus:ring-2 focus:outline-hidden focus:group-[.destructive]:ring-red-400 focus:group-[.destructive]:ring-offset-red-600',
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.ToastClose>
))
ToastClose.displayName = 'ToastClose'

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastTitle>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.ToastTitle>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.ToastTitle
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.ToastDescription>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.ToastDescription>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.ToastDescription
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = 'ToastDescription'

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<
  React.ComponentProps<typeof ToastAction>
>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
