import { reactive } from 'vue'

/**
 * Initial state factory — used for creation and reset.
 */
function createInitialState() {
  return {
    gamePhase: 'title', // 'title' | 'act-intro' | 'playing' | 'recap' | 'badges'
    currentAct: 1,
    currentScene: 'port-arrival',

    player: {
      name: 'Captain',
      health: 100,
      gold: 0,
      reputation: 50,
    },

    inventory: [],

    flags: {},

    badges: {
      variables: false,
      ifElse: false,
      whileLoops: false,
      functions: false,
      forLoops: false,
      arrays: false,
    },

    dialogue: {
      active: false,
      speaker: '',
      text: '',
      queue: [],
    },

    pseudocode: {
      visible: false,
      snippetId: null,
      highlightLine: -1,
      variables: {},
    },

    choices: {
      active: false,
      options: [],
    },
  }
}

// Singleton reactive state — shared across all composable instances
const state = reactive(createInitialState())

/**
 * Central game state composable.
 * Returns the reactive state object and all mutation methods.
 */
export function useGameState() {
  // ── Phase & Scene ──────────────────────────────────────────────────────────

  function startGame() {
    state.gamePhase = 'act-intro'
    state.currentAct = 1
    state.currentScene = 'port-arrival'
  }

  function setScene(sceneId) {
    state.currentScene = sceneId
  }

  function setAct(actNum) {
    state.currentAct = actNum
    state.gamePhase = 'act-intro'
  }

  function setPhase(phase) {
    state.gamePhase = phase
  }

  // ── Inventory ──────────────────────────────────────────────────────────────

  function addItem(item) {
    if (!state.inventory.includes(item)) {
      state.inventory.push(item)
    }
  }

  function removeItem(item) {
    const index = state.inventory.indexOf(item)
    if (index !== -1) {
      state.inventory.splice(index, 1)
    }
  }

  function hasItem(item) {
    return state.inventory.includes(item)
  }

  // ── Story Flags ────────────────────────────────────────────────────────────

  function setFlag(key, value) {
    state.flags[key] = value
  }

  function getFlag(key) {
    return state.flags[key]
  }

  // ── Player Stats ───────────────────────────────────────────────────────────

  /**
   * Adjusts a player stat by the given amount.
   * Clamps numeric stats to 0–100; gold has no upper limit.
   *
   * @param {'health'|'gold'|'reputation'} stat
   * @param {number} amount - Positive or negative delta
   */
  function adjustStat(stat, amount) {
    if (!(stat in state.player)) return

    const newValue = state.player[stat] + amount

    if (stat === 'gold') {
      state.player[stat] = Math.max(0, newValue)
    } else {
      state.player[stat] = Math.min(100, Math.max(0, newValue))
    }
  }

  // ── Badges ─────────────────────────────────────────────────────────────────

  function awardBadge(badgeId) {
    if (badgeId in state.badges) {
      state.badges[badgeId] = true
    }
  }

  function hasBadge(badgeId) {
    return state.badges[badgeId] === true
  }

  // ── Dialogue ───────────────────────────────────────────────────────────────

  function showDialogue(speaker, text) {
    state.dialogue.queue = []
    state.dialogue.speaker = speaker
    state.dialogue.text = text
    state.dialogue.active = true
  }

  /**
   * Accepts an array of { speaker, text } objects.
   * Shows the first entry immediately and queues the rest.
   *
   * @param {Array<{speaker: string, text: string}>} dialogues
   */
  function queueDialogue(dialogues) {
    if (!dialogues || dialogues.length === 0) return

    const [first, ...rest] = dialogues
    state.dialogue.speaker = first.speaker
    state.dialogue.text = first.text
    state.dialogue.queue = rest
    state.dialogue.active = true
  }

  function advanceDialogue() {
    if (state.dialogue.queue.length > 0) {
      const next = state.dialogue.queue.shift()
      state.dialogue.speaker = next.speaker
      state.dialogue.text = next.text
    } else {
      state.dialogue.active = false
      state.dialogue.speaker = ''
      state.dialogue.text = ''
      state.dialogue.queue = []
    }
  }

  // ── Pseudocode ─────────────────────────────────────────────────────────────

  function showPseudocode(snippetId, variables = {}) {
    state.pseudocode.snippetId = snippetId
    state.pseudocode.variables = variables
    state.pseudocode.highlightLine = -1
    state.pseudocode.visible = true
  }

  function hidePseudocode() {
    state.pseudocode.visible = false
    state.pseudocode.snippetId = null
    state.pseudocode.highlightLine = -1
    state.pseudocode.variables = {}
  }

  function highlightLine(lineNum) {
    state.pseudocode.highlightLine = lineNum
  }

  // ── Choices ────────────────────────────────────────────────────────────────

  /**
   * Shows the choice panel with the given options.
   *
   * @param {Array<{id: string, text: string, callback: Function}>} options
   */
  function showChoices(options) {
    state.choices.options = options
    state.choices.active = true
  }

  function hideChoices() {
    state.choices.active = false
    state.choices.options = []
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  function resetGame() {
    const fresh = createInitialState()
    Object.assign(state, fresh)
  }

  return {
    state,
    // Phase & scene
    startGame,
    setScene,
    setAct,
    setPhase,
    // Inventory
    addItem,
    removeItem,
    hasItem,
    // Flags
    setFlag,
    getFlag,
    // Stats
    adjustStat,
    // Badges
    awardBadge,
    hasBadge,
    // Dialogue
    showDialogue,
    queueDialogue,
    advanceDialogue,
    // Pseudocode
    showPseudocode,
    hidePseudocode,
    highlightLine,
    // Choices
    showChoices,
    hideChoices,
    // Reset
    resetGame,
  }
}
