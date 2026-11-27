import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ItemForm } from './item-form'

const compress = vi.fn()
vi.mock('@/utils/imageUtils', () => ({
  compressAndConvertToBase64: (file: File) => compress(file),
}))
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stand-in for next/image
    <img src={src} alt={alt} />
  ),
}))

beforeEach(() => {
  compress.mockReset().mockResolvedValue('data:image/jpeg;base64,AAAA')
  // jsdom lacks the animation and CSS APIs the SDK dialog calls.
  Element.prototype.getAnimations ??= () => []
  const css = (globalThis.CSS ??= {} as typeof CSS)
  css.supports ??= () => false
})

// The SDK's native input is hidden from the pointer; its trigger opens it.
const setup = (options: Parameters<typeof userEvent.setup>[0] = {}) =>
  userEvent.setup({ pointerEventsCheck: 0, ...options })

function fileInput() {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')
  expect(input).not.toBeNull()
  return input!
}

it('uploads an image through the SDK file input and submits it', async () => {
  const user = setup()
  const onSubmit = vi.fn()
  render(<ItemForm modelName="food" onClose={vi.fn()} onSubmit={onSubmit} />)

  const trigger = await screen.findByRole('button', { name: 'Upload Image' })
  expect(trigger).toHaveAttribute('type', 'button')
  expect(fileInput()).toHaveAttribute('accept', 'image/*')

  const photo = new File(['x'], 'apple.png', { type: 'image/png' })
  await user.upload(fileInput(), photo)

  await waitFor(() => expect(compress).toHaveBeenCalledWith(photo))
  expect(await screen.findByAltText('Item preview')).toHaveAttribute(
    'src',
    'data:image/jpeg;base64,AAAA',
  )

  await user.type(screen.getByLabelText('Name'), 'Apple')
  await user.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Apple',
      imageBase64: 'data:image/jpeg;base64,AAAA',
    }),
  )
})

it('ignores files that are not images', async () => {
  const user = setup({ applyAccept: false })
  render(<ItemForm modelName="food" onClose={vi.fn()} onSubmit={vi.fn()} />)
  await screen.findByRole('button', { name: 'Upload Image' })

  await user.upload(
    fileInput(),
    new File(['x'], 'notes.txt', { type: 'text/plain' }),
  )

  expect(compress).not.toHaveBeenCalled()
  expect(screen.queryByAltText('Item preview')).toBeNull()
})
