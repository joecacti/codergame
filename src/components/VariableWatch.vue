<script setup>
import { computed } from 'vue'

const props = defineProps({
  slots: { type: Object, required: true },
  correct: { type: Object, required: true },
})

const SLOT_ORDER = ['hull', 'sails', 'crew', 'anchor']

const TYPE_MAP = {
  hull: 'Text',
  sails: 'Number',
  crew: 'Number',
  anchor: 'Yes/No',
}

const boxes = computed(() =>
  SLOT_ORDER.map(name => {
    const val = props.slots[name]
    const isCorrect = val === props.correct[name]
    let displayVal = '?'
    let dataType = TYPE_MAP[name]
    if (val) {
      const match = val.match(/=\s*(.+)$/)
      displayVal = match ? match[1].trim() : val
    }
    return { name, val, displayVal, isCorrect, hasValue: !!val, dataType }
  })
)
</script>

<template>
  <div class="var-watch">
    <div class="vw-title">Memory</div>
    <div class="vw-boxes">
      <div
        v-for="box in boxes"
        :key="box.name"
        class="vw-box"
        :class="{ filled: box.hasValue, correct: box.hasValue && box.isCorrect, wrong: box.hasValue && !box.isCorrect }"
      >
        <div class="vw-name">{{ box.name }}</div>
        <div class="vw-value">{{ box.displayVal }}</div>
        <div class="vw-type">{{ box.dataType }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.var-watch {
  margin: 8px 16px;
  padding: 10px 12px;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
}
.vw-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 8px;
}
.vw-boxes { display: flex; gap: 8px; }
.vw-box {
  flex: 1;
  background: rgba(255,255,255,.04);
  border: 2px dashed rgba(255,255,255,.1);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  transition: all .3s;
}
.vw-box.filled {
  border-style: solid;
  animation: boxPop .3s ease;
}
.vw-box.correct { border-color: #22c55e; background: rgba(34,197,94,.08); }
.vw-box.wrong { border-color: #ef4444; background: rgba(239,68,68,.08); }
.vw-name {
  font-family: monospace;
  font-size: 11px;
  color: #fbbf24;
  margin-bottom: 4px;
}
.vw-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  min-height: 20px;
}
.vw-box.correct .vw-value { color: #86efac; }
.vw-box.wrong .vw-value { color: #fca5a5; }
.vw-box:not(.filled) .vw-value { color: #555; font-size: 18px; }
.vw-type {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: #666;
  margin-top: 4px;
}

@keyframes boxPop {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
