// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { compressAndConvertToBase64 } from './imageUtils'

let imageShouldError = false
let readerShouldError = false
let mockImageDimensions = { width: 1600, height: 800 }

class MockFileReader {
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  result: string | null = null

  readAsDataURL(_file: File) {
    queueMicrotask(() => {
      if (readerShouldError) {
        this.onerror?.(new Error('reader failed'))
        return
      }
      this.result = 'data:image/png;base64,fakedata'
      this.onload?.({ target: { result: this.result } })
    })
  }
}

class MockImage {
  onload: (() => void) | null = null
  onerror: ((error: any) => void) | null = null
  width = mockImageDimensions.width
  height = mockImageDimensions.height

  set src(_value: string) {
    queueMicrotask(() => {
      if (imageShouldError) {
        this.onerror?.(new Error('image failed'))
        return
      }
      this.onload?.()
    })
  }
}

function makeFile(): File {
  return new File(['fake-image-content'], 'photo.png', { type: 'image/png' })
}

describe('compressAndConvertToBase64', () => {
  let drawImageMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    imageShouldError = false
    readerShouldError = false
    mockImageDimensions = { width: 1600, height: 800 }

    vi.stubGlobal('FileReader', MockFileReader)
    vi.stubGlobal('Image', MockImage)

    drawImageMock = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: drawImageMock,
    } as any)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/jpeg;base64,compresseddata',
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('resolves with the compressed base64 string', async () => {
    const result = await compressAndConvertToBase64(makeFile())

    expect(result).toBe('data:image/jpeg;base64,compresseddata')
  })

  it('scales down a wide image while preserving aspect ratio', async () => {
    mockImageDimensions = { width: 1600, height: 800 }

    await compressAndConvertToBase64(makeFile(), 800, 800)

    expect(drawImageMock).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      800,
      400,
    )
  })

  it('scales down a tall image while preserving aspect ratio', async () => {
    mockImageDimensions = { width: 400, height: 1600 }

    await compressAndConvertToBase64(makeFile(), 800, 800)

    expect(drawImageMock).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      200,
      800,
    )
  })

  it('leaves images already within bounds unscaled', async () => {
    mockImageDimensions = { width: 400, height: 300 }

    await compressAndConvertToBase64(makeFile(), 800, 800)

    expect(drawImageMock).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      400,
      300,
    )
  })

  it('passes the quality argument through to toDataURL', async () => {
    const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')

    await compressAndConvertToBase64(makeFile(), 800, 800, 0.42)

    expect(toDataURLSpy).toHaveBeenCalledWith('image/jpeg', 0.42)
  })

  it('rejects when the image fails to load', async () => {
    imageShouldError = true

    await expect(compressAndConvertToBase64(makeFile())).rejects.toBeTruthy()
  })

  it('rejects when the file reader fails', async () => {
    readerShouldError = true

    await expect(compressAndConvertToBase64(makeFile())).rejects.toBeTruthy()
  })
})
