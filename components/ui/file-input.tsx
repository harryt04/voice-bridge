'use client'

import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import {
  FileInput as SdkFileInput,
  FileInputTrigger as SdkFileInputTrigger,
} from '@ui-sdk/react/file-input'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/** The root: holds the chosen files and renders the hidden native input. */
const FileInput = SdkFileInput

type FileInputTriggerProps = Omit<
  React.ComponentProps<typeof SdkFileInputTrigger>,
  'className'
> &
  VariantProps<typeof buttonVariants> & { className?: string }

/** Opens the system file picker, styled as a Button. */
function FileInputTrigger({
  className,
  variant = 'outline',
  size,
  ...props
}: FileInputTriggerProps) {
  return (
    <SdkFileInputTrigger
      data-vb-file-trigger=""
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { FileInput, FileInputTrigger }
