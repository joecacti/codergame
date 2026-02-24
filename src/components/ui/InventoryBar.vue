<script setup>
import { useGameState } from '../../composables/useGameState.js'

const { state } = useGameState()

const itemIcons = {
  compass: '🧭',
  map: '🗺️',
  rope: '🪢',
  lantern: '🏮',
  key: '🗝️',
  potion: '🧪',
  sword: '⚔️',
  pistol: '🔫',
}

function getItemIcon(item) {
  return itemIcons[item] ?? '📦'
}
</script>

<template>
  <div class="inventory-bar" aria-label="Inventory">
    <h3 class="inventory-bar__title">Inventory</h3>

    <div v-if="state.inventory.length === 0" class="inventory-empty">
      <span aria-hidden="true">🎒</span>
      <p>Empty hold</p>
    </div>

    <ul v-else class="inventory-list" role="list">
      <li
        v-for="item in state.inventory"
        :key="item"
        class="inventory-item"
        role="listitem"
        :aria-label="item"
        :title="item"
      >
        <span class="inventory-item__icon" aria-hidden="true">{{ getItemIcon(item) }}</span>
        <span class="inventory-item__label">{{ item }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.inventory-bar {
  padding: 1rem;
}

.inventory-bar__title {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold);
  margin-bottom: 0.75rem;
}

.inventory-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  opacity: 0.35;
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-parchment);
  padding: 0.5rem 0;
}

.inventory-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.6rem;
  background: rgba(244, 228, 193, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: var(--border-radius-sm);
  cursor: default;
  transition: background var(--transition-fast);
}

.inventory-item:hover {
  background: rgba(244, 228, 193, 0.1);
}

.inventory-item__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.inventory-item__label {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--color-parchment);
  opacity: 0.8;
  text-transform: capitalize;
}
</style>
