<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  parts: { type: Array, default: () => [] },
  visible: { type: Boolean, default: true },
})

const collapsed = ref(false)
const revealedCount = ref(0)

watch(() => props.parts, () => {
  revealedCount.value = 0
  if (props.parts.length > 0) {
    let i = 0
    const reveal = () => {
      if (i < props.parts.length) {
        revealedCount.value = ++i
        setTimeout(reveal, 400)
      }
    }
    setTimeout(reveal, 300)
  }
}, { immediate: true })

const TYPE_COLORS = {
  keyword: '#60a5fa',
  variable: '#fbbf24',
  operator: '#c084fc',
  string: '#4ade80',
  number: '#fb923c',
  boolean: '#f472b6',
  condition: '#a5f3fc',
  action: '#86efac',
}

const TYPE_LABELS = {
  keyword: 'Keyword',
  variable: 'Variable Name',
  operator: 'Operator',
  string: 'String (Text)',
  number: 'Number',
  boolean: 'Boolean (Yes/No)',
  condition: 'Condition',
  action: 'Action',
}
</script>

<template>
  <div v-if="visible && parts.length > 0" class="explainer" :class="{ collapsed }">
    <button class="explainer-toggle" @click="collapsed = !collapsed">
      <span class="explainer-icon">{{ collapsed ? '>' : 'v' }}</span>
      Code Breakdown
    </button>
    <div v-if="!collapsed" class="explainer-body">
      <div
        v-for="(part, i) in parts"
        :key="i"
        class="explainer-part"
        :class="{ revealed: i < revealedCount }"
      >
        <code class="part-code" :style="{ color: TYPE_COLORS[part.type] || '#e2e8f0' }">{{ part.text }}</code>
        <span class="part-type" :style="{ color: TYPE_COLORS[part.type] || '#888' }">{{ TYPE_LABELS[part.type] || part.type }}</span>
        <span class="part-meaning">{{ part.meaning }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explainer {
  margin: 8px 16px;
  background: rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  overflow: hidden;
}
.explainer.collapsed { border-color: rgba(255,255,255,.05); }
.explainer-toggle {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255,255,255,.04);
  border: none;
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.explainer-toggle:hover { color: #fbbf24; }
.explainer-icon { margin-right: 6px; font-family: monospace; }
.explainer-body { padding: 8px 12px 12px; }
.explainer-part {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 5px 0;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .3s, transform .3s;
  border-bottom: 1px solid rgba(255,255,255,.04);
}
.explainer-part:last-child { border-bottom: none; }
.explainer-part.revealed { opacity: 1; transform: translateY(0); }
.part-code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 700;
  min-width: 70px;
  background: rgba(255,255,255,.05);
  padding: 2px 6px;
  border-radius: 3px;
}
.part-type {
  font-size: 10px;
  min-width: 80px;
  text-transform: uppercase;
  letter-spacing: .5px;
}
.part-meaning { font-size: 12px; color: #e2e8f0; }
</style>
