import { ref, watch, onUnmounted } from 'vue'
import { useGameState } from './useGameState.js'

/**
 * Dialogue composable with typewriter text reveal effect.
 * Watches game state dialogue changes and automatically starts
 * the typewriter animation when new dialogue is shown.
 */
export function useDialogue() {
  const { state, advanceDialogue } = useGameState()

  /** The currently displayed text (builds up character by character) */
  const typewriterText = ref('')

  /** Whether the typewriter animation is currently running */
  const isTyping = ref(false)

  /** Internal interval handle */
  let intervalHandle = null

  /** The full target text being revealed */
  let targetText = ''

  /**
   * Clears any running typewriter interval.
   */
  function clearTypewriter() {
    if (intervalHandle !== null) {
      clearInterval(intervalHandle)
      intervalHandle = null
    }
  }

  /**
   * Starts the typewriter animation for the given text.
   *
   * @param {string} text - Full text to reveal
   * @param {number} speed - Milliseconds between each character (default 30)
   */
  function startTypewriter(text, speed = 30) {
    clearTypewriter()
    targetText = text
    typewriterText.value = ''
    isTyping.value = true

    let charIndex = 0

    intervalHandle = setInterval(() => {
      if (charIndex < targetText.length) {
        typewriterText.value += targetText[charIndex]
        charIndex++
      } else {
        clearTypewriter()
        isTyping.value = false
      }
    }, speed)
  }

  /**
   * Instantly reveals the full text, stopping the typewriter animation.
   */
  function skipTypewriter() {
    if (!isTyping.value) return
    clearTypewriter()
    typewriterText.value = targetText
    isTyping.value = false
  }

  /**
   * Primary click handler for the dialogue box.
   * - If typing: skips to full text.
   * - If done typing: advances to the next queued dialogue (or closes).
   */
  function handleClick() {
    if (isTyping.value) {
      skipTypewriter()
    } else {
      advanceDialogue()
    }
  }

  // Watch dialogue state for changes and trigger typewriter
  watch(
    () => state.dialogue.text,
    (newText) => {
      if (state.dialogue.active && newText) {
        startTypewriter(newText)
      } else if (!state.dialogue.active) {
        clearTypewriter()
        typewriterText.value = ''
        isTyping.value = false
      }
    },
    { immediate: true }
  )

  watch(
    () => state.dialogue.active,
    (active) => {
      if (!active) {
        clearTypewriter()
        typewriterText.value = ''
        isTyping.value = false
      }
    }
  )

  onUnmounted(() => {
    clearTypewriter()
  })

  return {
    typewriterText,
    isTyping,
    startTypewriter,
    skipTypewriter,
    handleClick,
  }
}
