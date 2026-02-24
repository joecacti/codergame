<script setup>
import { ref } from 'vue'

defineProps({
  currentScreen: { type: String, required: true }
})

const emit = defineEmits(['restart-level', 'start-over'])
const open = ref(false)

function restartLevel() {
  open.value = false
  emit('restart-level')
}

function startOver() {
  open.value = false
  emit('start-over')
}
</script>

<template>
  <div v-if="!['login', 'admin'].includes(currentScreen)" class="settings-wrapper">
    <button class="settings-fab" @click="open = !open" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/>
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="open" class="settings-backdrop" @click="open = false">
          <div class="settings-panel" @click.stop>
            <h3 class="settings-title">Settings</h3>

            <button class="settings-btn" @click="restartLevel">
              <span class="settings-btn-icon">&#x21bb;</span>
              Restart Level
            </button>

            <button class="settings-btn settings-btn--danger" @click="startOver">
              <span class="settings-btn-icon">&#x26A0;</span>
              Start Over
            </button>

            <button class="settings-btn settings-btn--close" @click="open = false">
              Close
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.settings-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: var(--border-gold);
  background: var(--color-navy);
  color: var(--color-gold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-dark);
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.settings-fab:hover {
  transform: scale(1.1);
  background: var(--color-navy-light);
}

.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-panel {
  background: var(--color-navy);
  border: var(--border-gold);
  border-radius: var(--border-radius-lg);
  padding: 28px 24px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-gold), var(--shadow-dark);
}

.settings-title {
  font-family: var(--font-heading);
  color: var(--color-gold);
  text-align: center;
  margin: 0 0 4px;
  font-size: 1.3rem;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gold-dark);
  background: var(--color-navy-light);
  color: var(--color-parchment);
  font-family: var(--font-body);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.settings-btn:hover {
  background: var(--color-navy);
  border-color: var(--color-gold);
}

.settings-btn-icon {
  font-size: 1.2rem;
}

.settings-btn--danger {
  border-color: var(--color-blood);
  color: var(--color-blood-light);
}

.settings-btn--danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--color-blood-light);
}

.settings-btn--close {
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-parchment-dark);
  font-size: 0.85rem;
  margin-top: 2px;
}

.settings-btn--close:hover {
  color: var(--color-parchment);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
