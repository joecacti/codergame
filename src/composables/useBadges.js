import { computed, ref } from 'vue'
import { useGameState } from './useGameState.js'
import { badges } from '../data/badges.js'

/**
 * Badge management composable.
 * Provides computed badge lists, award logic, and a recent-badge ref
 * that can drive toast notifications.
 */
export function useBadges() {
  const { state, awardBadge } = useGameState()

  /**
   * The most recently awarded badge object, or null if none.
   * Intended for driving a toast/notification component.
   */
  const recentBadge = ref(null)

  /**
   * List of badge objects the player has already earned.
   */
  const earnedBadges = computed(() => {
    return Object.values(badges).filter((badge) => state.badges[badge.id] === true)
  })

  /**
   * List of badge objects the player has not yet earned.
   */
  const lockedBadges = computed(() => {
    return Object.values(badges).filter((badge) => state.badges[badge.id] !== true)
  })

  /**
   * Whether all 6 badges have been earned.
   */
  const allEarned = computed(() => {
    return Object.keys(badges).every((id) => state.badges[id] === true)
  })

  /**
   * Awards a badge if it has not already been earned.
   * Sets recentBadge to the awarded badge object.
   *
   * @param {string} badgeId - A key from the badges registry
   * @returns {boolean} true if the badge was newly awarded, false if already owned
   */
  function checkAndAward(badgeId) {
    if (!(badgeId in badges)) return false
    if (state.badges[badgeId] === true) return false

    awardBadge(badgeId)
    recentBadge.value = badges[badgeId]
    return true
  }

  /**
   * Clears the recentBadge ref after the toast has been shown.
   */
  function clearRecent() {
    recentBadge.value = null
  }

  return {
    earnedBadges,
    lockedBadges,
    allEarned,
    recentBadge,
    checkAndAward,
    clearRecent,
  }
}
