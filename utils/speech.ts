export const speakText = (text: string): void => {
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  speechSynthesis.speak(utterance)
}
