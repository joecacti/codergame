import { computed } from 'vue'
import { useGameState } from './useGameState.js'
import { snippets } from '../data/pseudocode-snippets.js'

/**
 * Composable for managing the pseudocode panel.
 * Handles snippet lookup, variable interpolation, line highlighting,
 * and animated sequence playback.
 */
export function usePseudocode() {
  const { state, showPseudocode, hidePseudocode, highlightLine: setHighlightLine } = useGameState()

  /**
   * The currently active snippet object, or null if none is set.
   */
  const currentSnippet = computed(() => {
    const id = state.pseudocode.snippetId
    if (!id) return null
    return snippets[id] ?? null
  })

  /**
   * The snippet's code lines with {varName} placeholders replaced by
   * the actual values from state.pseudocode.variables.
   */
  const renderedLines = computed(() => {
    if (!currentSnippet.value) return []
    const vars = state.pseudocode.variables

    return currentSnippet.value.lines.map((line) => {
      return line.replace(/\{(\w+)\}/g, (match, varName) => {
        return varName in vars ? String(vars[varName]) : match
      })
    })
  })

  /**
   * Shows a snippet in the panel with optional variable bindings.
   *
   * @param {string} snippetId - Key from pseudocode-snippets.js
   * @param {Object} variables - Map of variable names to values for interpolation
   */
  function showSnippet(snippetId, variables = {}) {
    showPseudocode(snippetId, variables)
  }

  /**
   * Hides the pseudocode panel and clears the active snippet.
   */
  function hideSnippet() {
    hidePseudocode()
  }

  /** Internal handle for the auto-advance timer used in highlightLine */
  let highlightTimer = null

  /**
   * Highlights a specific line number, then clears the highlight after 1.5s.
   *
   * @param {number} lineNum - Zero-based line index to highlight
   */
  function highlightLine(lineNum) {
    if (highlightTimer !== null) {
      clearTimeout(highlightTimer)
      highlightTimer = null
    }

    setHighlightLine(lineNum)

    highlightTimer = setTimeout(() => {
      setHighlightLine(-1)
      highlightTimer = null
    }, 1500)
  }

  /** Internal handle for the sequence animation */
  let sequenceTimer = null

  /**
   * Highlights lines one by one, pausing `delay` ms between each.
   * Clears any existing sequence before starting a new one.
   *
   * @param {number[]} lines - Array of zero-based line indices
   * @param {number} delay - Milliseconds between each highlight (default 1000)
   */
  function animateSequence(lines, delay = 1000) {
    if (sequenceTimer !== null) {
      clearTimeout(sequenceTimer)
      sequenceTimer = null
    }
    if (highlightTimer !== null) {
      clearTimeout(highlightTimer)
      highlightTimer = null
    }

    let index = 0

    function next() {
      if (index >= lines.length) {
        setHighlightLine(-1)
        return
      }

      setHighlightLine(lines[index])
      index++

      sequenceTimer = setTimeout(() => {
        sequenceTimer = null
        next()
      }, delay)
    }

    next()
  }

  return {
    currentSnippet,
    renderedLines,
    showSnippet,
    hideSnippet,
    highlightLine,
    animateSequence,
  }
}
