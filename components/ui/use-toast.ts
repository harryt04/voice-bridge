'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import { createToaster } from '@ui-sdk/react/toast'
import type { ToastActionElement, ToastProps } from './toast'

export const toastQueue = createToaster<ReactNode>()

type Message = {
  title?: ReactNode
  description?: ReactNode
  variant?: ToastProps['variant']
  duration?: number
  action?: ToastActionElement
}

function options({ title, description, duration, variant, action }: Message) {
  return {
    title,
    description,
    duration,
    type: variant === 'destructive' ? ('error' as const) : ('default' as const),
    data: action,
  }
}

export function toast(message: Message | string) {
  const id = toastQueue(
    typeof message === 'string' ? message : options(message),
  )
  return {
    id,
    dismiss: () => toastQueue.dismiss(id),
    update: (next: Message) => toastQueue.update(id, options(next)),
  }
}

export function useToast() {
  const toasts = useSyncExternalStore(
    toastQueue.subscribe,
    toastQueue.toasts,
    toastQueue.toasts,
  )
  return { toasts, toast, dismiss: toastQueue.dismiss }
}
