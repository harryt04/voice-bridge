// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { openGoogleMapsDirections } from './directions'

describe('openGoogleMapsDirections', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn())
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('opens a Google Maps URL with the encoded address', () => {
    openGoogleMapsDirections('123 Main St, Springfield')

    expect(window.open).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20Springfield',
      '_blank',
    )
  })

  it('logs an error and does not open a window when address is empty', () => {
    openGoogleMapsDirections('')

    expect(window.open).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalled()
  })
})
