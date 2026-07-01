/**
 * AAC Speech Synthesis Utility
 *
 * Client-side TTS helper for speaking AAC phrases and symbols.
 * IMPORTANT: This file MUST ONLY be imported and called from client components.
 * It accesses window.speechSynthesis, which is browser-only.
 *
 * Addresses G14: Client-side speech synthesis utility with graceful error handling.
 * Addresses G11: All operations wrapped in try-catch with graceful degradation (no throw).
 */

export type SpeechPrefs = {
  voiceName?: string
  speechRate?: number
  speechPitch?: number
}

/**
 * Speaks text using Web Speech API with optional preferences.
 *
 * Cancels any ongoing speech before starting a new utterance.
 * All errors are caught and logged; the function never throws.
 *
 * @param text - Text to speak
 * @param prefs - Optional speech preferences (voiceName, speechRate, speechPitch)
 */
export function speak(text: string, prefs: SpeechPrefs = {}) {
  if (!text.trim()) return

  try {
    const synth = window.speechSynthesis
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = prefs.speechRate ?? 1
    utterance.pitch = prefs.speechPitch ?? 1

    if (prefs.voiceName) {
      const voices = synth.getVoices()
      const voice = voices.find((v) => v.name === prefs.voiceName) ?? null
      utterance.voice = voice
    }

    synth.speak(utterance)
  } catch (error) {
    console.error('Speech synthesis failed:', error)
    // Gracefully degrade — do not throw
  }
}
