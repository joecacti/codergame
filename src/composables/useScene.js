import { computed } from 'vue'
import { useGameState } from './useGameState.js'
import { act1Scenes } from '../data/scenes/act1-port-compile.js'
import { act2Scenes } from '../data/scenes/act2-skeleton-bay.js'
import { act3Scenes } from '../data/scenes/act3-isle-of-riddles.js'
import { act4Scenes } from '../data/scenes/act4-treasure-cave.js'

/**
 * Fallback scene used when a scene ID cannot be resolved.
 */
const defaultScene = {
  id: 'default',
  background: null,
  placeholderColor: '#4a6741',
  placeholderLabel: 'Scene',
  hotspots: [],
  onEnter: null,
}

/**
 * Scene registry built from all act scene files.
 * Keys are scene IDs; values are scene data objects.
 */
const sceneRegistry = {
  ...act1Scenes,
  ...act2Scenes,
  ...act3Scenes,
  ...act4Scenes,
}

/**
 * Scene navigation composable.
 * Provides loadScene, handleHotspot, and computed currentScene.
 */
export function useScene() {
  const gameState = useGameState()
  const { state, setScene, showDialogue, queueDialogue, addItem, removeItem, setFlag, adjustStat, showPseudocode, showChoices, hideChoices, awardBadge, setAct, setPhase } = gameState

  /**
   * Returns the current scene data object.
   * Falls back to defaultScene if the scene ID is not registered.
   */
  function getScene() {
    return sceneRegistry[state.currentScene] ?? defaultScene
  }

  /**
   * Loads a scene by ID, updates game state, and runs onEnter if defined.
   *
   * @param {string} sceneId
   */
  function loadScene(sceneId) {
    const scene = sceneRegistry[sceneId] ?? defaultScene
    setScene(scene.id)
    if (typeof scene.onEnter === 'function') {
      scene.onEnter(state)
    }
  }

  /**
   * Builds the helpers object passed to every hotspot action callback.
   * Wraps all game state mutation methods for convenient use in scene data.
   *
   * @returns {Object} helpers
   */
  function buildHelpers() {
    return {
      showDialogue: (speaker, text) => showDialogue(speaker, text),
      queueDialogue: (dialogues) => queueDialogue(dialogues),
      addItem: (item) => addItem(item),
      removeItem: (item) => removeItem(item),
      setFlag: (key, value) => setFlag(key, value ?? true),
      adjustStat: (stat, amount) => adjustStat(stat, amount),
      showPseudocode: (id, vars) => showPseudocode(id, vars),
      showChoices: (options) => showChoices(options),
      hideChoices: () => hideChoices(),
      awardBadge: (id) => awardBadge(id),
      setScene: (id) => loadScene(id),
      setAct: (n) => setAct(n),
      setPhase: (p) => setPhase(p),
    }
  }

  /**
   * Finds a hotspot in the current scene by ID and runs its action.
   * Passes the current state and a helpers object to the action callback.
   *
   * @param {string} hotspotId
   */
  function handleHotspot(hotspotId) {
    const scene = getScene()
    const hotspot = scene.hotspots.find((h) => h.id === hotspotId)
    if (!hotspot) return

    // Support legacy `handler` key as well as the new `action` key
    const fn = hotspot.action ?? hotspot.handler
    if (typeof fn === 'function') {
      fn(state, buildHelpers())
    }
  }

  /**
   * Registers a scene in the registry programmatically.
   * Useful for one-off scenes defined inside components.
   *
   * @param {string} sceneId
   * @param {Object} sceneData
   */
  function registerScene(sceneId, sceneData) {
    sceneRegistry[sceneId] = sceneData
  }

  /**
   * Returns visible hotspots for the current scene.
   * Hotspots with a `visible` function are evaluated against current state.
   * Hotspots with `visible: true` (or no visible property) are always shown.
   */
  const currentScene = computed(() => {
    const scene = getScene()
    const visibleHotspots = scene.hotspots.filter((h) => {
      if (typeof h.visible === 'function') return h.visible(state)
      return h.visible !== false
    })
    return { ...scene, hotspots: visibleHotspots }
  })

  return {
    currentScene,
    getScene,
    loadScene,
    handleHotspot,
    registerScene,
    buildHelpers,
  }
}
