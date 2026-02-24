<script setup>
import { useGameState } from '../../composables/useGameState.js'
import { useScene } from '../../composables/useScene.js'

const { state, hideChoices } = useGameState()
const { buildHelpers } = useScene()

/**
 * Handle a choice selection.
 * - Hides the choice panel first so callbacks can open other UI.
 * - Supports `action(helpers)` (new format) and `callback()` (legacy closure format).
 */
function selectOption(option) {
  hideChoices()
  if (typeof option.action === 'function') {
    option.action(buildHelpers())
  } else if (typeof option.callback === 'function') {
    option.callback()
  }
}
</script>

<template>
  <Transition name="choices">
    <div
      v-if="state.choices.active"
      class="choice-panel"
      role="dialog"
      aria-label="Make a choice"
      aria-modal="true"
    >
      <div class="choice-panel__inner">
        <p class="choice-panel__prompt">What will ye do, Captain?</p>

        <ul class="choice-list" role="list">
          <li
            v-for="option in state.choices.options"
            :key="option.id"
            class="choice-item"
            role="listitem"
          >
            <button
              class="choice-btn"
              @click="selectOption(option)"
              :aria-label="option.text"
            >
              <span class="choice-btn__arrow" aria-hidden="true">&#9658;</span>
              <span class="choice-btn__text">{{ option.text }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.choice-panel {
  position: absolute;
  inset: 0;
  bottom: 0;
  z-index: var(--z-choices);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 180px; /* above dialogue box */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.choice-panel__inner {
  width: min(480px, 90%);
  padding: 1.25rem 1.5rem;
  background: linear-gradient(
    160deg,
    var(--color-wood-light) 0%,
    var(--color-wood) 100%
  );
  border: 3px solid var(--color-gold-dark);
  border-radius: var(--border-radius-md);
  box-shadow:
    0 -4px 24px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Worn wood grain effect */
.choice-panel__inner::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(
    88deg,
    transparent 0px,
    transparent 18px,
    rgba(0, 0, 0, 0.04) 18px,
    rgba(0, 0, 0, 0.04) 20px
  );
  pointer-events: none;
}

.choice-panel__prompt {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold-light);
  text-align: center;
  margin-bottom: 0.85rem;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.choice-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice-btn {
  width: 100%;
  text-align: left;
  padding: 0.65em 1em;
  background: linear-gradient(
    135deg,
    rgba(244, 228, 193, 0.12) 0%,
    rgba(244, 228, 193, 0.06) 100%
  );
  color: var(--color-parchment);
  border: 1px solid rgba(212, 160, 23, 0.35);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-body);
  font-size: 0.9rem;
  letter-spacing: 0.01em;
  text-transform: none;
  box-shadow: none;
  gap: 0.6em;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.choice-btn::before {
  display: none;
}

.choice-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(212, 160, 23, 0.25) 0%,
    rgba(212, 160, 23, 0.12) 100%
  );
  border-color: rgba(212, 160, 23, 0.7);
  color: var(--color-parchment);
  box-shadow: 0 0 12px rgba(212, 160, 23, 0.2);
  transform: translateX(3px);
}

.choice-btn:active {
  transform: translateX(3px) scale(0.98);
  box-shadow: none;
}

.choice-btn__arrow {
  color: var(--color-gold);
  font-size: 0.75em;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.choice-btn:hover .choice-btn__arrow {
  opacity: 1;
}

.choice-btn__text {
  flex: 1;
}
</style>
