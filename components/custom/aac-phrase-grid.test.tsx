import { createContext } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AacPreferencesContext, AacSentenceContext } from '@/app/aac/layout'
import { AacPhraseGrid } from '@/components/custom/aac-phrase-grid'
import { DEFAULT_PHRASES } from '@/lib/aac/default-phrases'
import type { AacPhrase } from '@/models'

vi.mock('@/app/aac/layout', () => ({
  AacPreferencesContext: createContext(null),
  AacSentenceContext: createContext(null),
}))

vi.mock('@/utils/aac-speech', () => ({ speak: vi.fn() }))

function renderGrid(customPhrases: AacPhrase[] = []) {
  const addWord = vi.fn()
  render(
    <AacPreferencesContext.Provider
      value={{ preferences: { phraseTapBehavior: 'append' } } as any}
    >
      <AacSentenceContext.Provider value={{ addWord } as any}>
        <AacPhraseGrid customPhrases={customPhrases} />
      </AacSentenceContext.Provider>
    </AacPreferencesContext.Provider>,
  )
  return addWord
}

describe('AAC phrase icons', () => {
  it('shows an emoji on every built-in phrase and preserves it when appended', () => {
    const addWord = renderGrid()
    const tiles = new Map(
      screen
        .getAllByRole('button')
        .map((tile) => [tile.getAttribute('aria-label'), tile]),
    )
    for (const phrase of DEFAULT_PHRASES) {
      expect(phrase.icon).toBeTruthy()
      const tile = tiles.get(phrase.text)!
      expect(tile.querySelector('[aria-hidden="true"]')).toHaveTextContent(
        phrase.icon!,
      )
    }
    fireEvent.click(screen.getByRole('button', { name: 'Hello!' }))
    expect(addWord).toHaveBeenCalledWith({
      label: 'Hello!',
      imageUrl: '/placeholder.svg',
      icon: '👋',
    })
  })

  it('renders a custom Lucide icon as an SVG rather than its name', () => {
    renderGrid([
      { _id: 'custom', text: 'My drink', icon: 'CupSoda' } as AacPhrase,
    ])
    const tile = screen.getByRole('button', { name: 'My drink' })
    expect(tile.querySelector('svg.lucide-cup-soda')).toBeInTheDocument()
    expect(tile).not.toHaveTextContent('CupSoda')
  })

  it('falls back to the category or speech bubble for missing or unknown icons', () => {
    renderGrid([
      { _id: 'one', text: 'At home', category: 'home' } as AacPhrase,
      { _id: 'two', text: 'Unknown', icon: 'NotAnIcon' } as AacPhrase,
    ])
    expect(
      screen
        .getByRole('button', { name: 'At home' })
        .querySelector('svg.lucide-house'),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('button', { name: 'Unknown' })
        .querySelector('svg.lucide-message-circle'),
    ).toBeInTheDocument()
  })
})
