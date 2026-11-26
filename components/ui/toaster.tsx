'use client'
import { isValidElement } from 'react'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from './toast'
import { toastQueue } from './use-toast'

export function Toaster() {
  return (
    <ToastViewport
      toaster={toastQueue}
      aria-label="Notifications"
      align="end"
      side="bottom"
    >
      {(message) => (
        <Toast variant={message.type === 'error' ? 'destructive' : 'default'}>
          <div className="grid gap-1">
            <ToastTitle />
            <ToastDescription />
          </div>
          {isValidElement(message.data) && message.data}
          <ToastClose aria-label="Close notification" />
        </Toast>
      )}
    </ToastViewport>
  )
}
