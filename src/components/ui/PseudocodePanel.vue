<script setup>
import { ref } from 'vue'
import { useGameState } from '../../composables/useGameState.js'
import { usePseudocode } from '../../composables/usePseudocode.js'

const { state } = useGameState()
const { currentSnippet, renderedLines, hideSnippet } = usePseudocode()

/** Controls whether the panel is collapsed (slid off to the right) */
const isCollapsed = ref(false)

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

/**
 * Concept badge labels shown beneath the snippet title.
 */
const conceptLabels = {
  variables: 'Variables',
  ifElse: 'IF / ELSE',
  whileLoops: 'WHILE Loops',
  functions: 'Functions',
  forLoops: 'FOR Loops',
  debugging: 'Debugging',
  arrays: 'Arrays',
  recap: 'Recap',
}

/**
 * Returns the display label for a concept key.
 * @param {string} concept
 */
function conceptLabel(concept) {
  return conceptLabels[concept] ?? concept
}
</script>

<template>
  <!-- Outer wrapper handles the slide-in/out collapse -->
  <div
    class="pseudocode-panel"
    :class="{ 'pseudocode-panel--collapsed': isCollapsed }"
    aria-label="Captain's Codebook"
  >
    <!-- ── Collapse toggle tab ─────────────────────────────────────────────── -->
    <button
      class="panel-tab"
      :aria-label="isCollapsed ? 'Expand Captain\'s Codebook' : 'Collapse Captain\'s Codebook'"
      :aria-expanded="!isCollapsed"
      @click="toggleCollapsed"
    >
      <span class="panel-tab__icon" aria-hidden="true">{{ isCollapsed ? '◀' : '▶' }}</span>
      <span class="panel-tab__label" aria-hidden="true">Codebook</span>
    </button>

    <!-- ── Panel body ─────────────────────────────────────────────────────── -->
    <div class="panel-body" aria-hidden="{{ isCollapsed }}">
      <!-- Header -->
      <div class="panel-header">
        <div class="panel-header__left">
          <span class="panel-header__skull" aria-hidden="true">☠</span>
          <h2 class="panel-header__title">Captain's Codebook</h2>
        </div>
        <button
          v-if="state.pseudocode.visible"
          class="panel-close-btn"
          aria-label="Close snippet"
          @click="hideSnippet"
        >✕</button>
      </div>

      <!-- ── Active snippet ────────────────────────────────────────────────── -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="state.pseudocode.visible && currentSnippet"
          key="snippet"
          class="snippet-area"
        >
          <!-- Snippet title + concept badge -->
          <div class="snippet-meta">
            <span class="snippet-title">{{ currentSnippet.title }}</span>
            <span
              class="concept-badge"
              :class="`concept-badge--${currentSnippet.concept}`"
              aria-label="Concept"
            >{{ conceptLabel(currentSnippet.concept) }}</span>
          </div>

          <!-- Code editor area -->
          <div class="code-editor" aria-label="Pseudocode example">
            <div class="code-editor__chrome">
              <span class="chrome-dot chrome-dot--red" aria-hidden="true"></span>
              <span class="chrome-dot chrome-dot--yellow" aria-hidden="true"></span>
              <span class="chrome-dot chrome-dot--green" aria-hidden="true"></span>
              <span class="chrome-filename" aria-hidden="true">{{ currentSnippet.id }}.pseudo</span>
            </div>

            <pre
              class="code-block"
              role="region"
              :aria-label="`${currentSnippet.title} pseudocode`"
            ><code><div
                v-for="(line, index) in renderedLines"
                :key="index"
                class="code-line"
                :class="{
                  'code-line--highlighted': state.pseudocode.highlightLine === index,
                  'code-line--comment': line.trim().startsWith('//'),
                  'code-line--empty': line.trim() === '',
                  'code-line--keyword': /^(IF|ELSE|WHILE|FOR|FUNCTION|END|SET|PRINT|RETURN|SAIL|EXPLORE|CHOOSE)\b/.test(line.trim()),
                }"
                :aria-current="state.pseudocode.highlightLine === index ? 'step' : undefined"
              ><span class="line-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span><span class="line-code">{{ line || '\u00a0' }}</span></div></code></pre>
          </div>

          <!-- Variable watch panel -->
          <div
            v-if="Object.keys(state.pseudocode.variables).length > 0"
            class="var-watch"
            aria-label="Variable values"
          >
            <p class="var-watch__title">
              <span aria-hidden="true">⚙</span> Variables
            </p>
            <div class="var-watch__list">
              <div
                v-for="(value, key) in state.pseudocode.variables"
                :key="key"
                class="var-row"
              >
                <span class="var-row__name">{{ key }}</span>
                <span class="var-row__equals" aria-hidden="true">=</span>
                <span class="var-row__value">{{ JSON.stringify(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Empty state ──────────────────────────────────────────────────── -->
        <div
          v-else
          key="empty"
          class="panel-empty"
          role="status"
          aria-label="No code snippet active"
        >
          <div class="panel-empty__book" aria-hidden="true">
            <span class="panel-empty__icon">📖</span>
          </div>
          <p class="panel-empty__heading">The Codebook Awaits</p>
          <p class="panel-empty__text">
            Click on objects to see the code behind the magic!
          </p>
        </div>
      </Transition>

      <!-- ── Divider ───────────────────────────────────────────────────────── -->
      <div class="panel-divider" aria-hidden="true"></div>

      <!-- ── Badge shelf ───────────────────────────────────────────────────── -->
      <div class="panel-badges" aria-label="Earned badges">
        <p class="panel-badges__title">Badges Earned</p>
        <div class="badge-row">
          <span
            v-for="(earned, badgeId) in state.badges"
            :key="badgeId"
            class="mini-badge"
            :class="{ 'mini-badge--earned': earned }"
            :title="conceptLabels[badgeId] ?? badgeId"
            :aria-label="`${conceptLabels[badgeId] ?? badgeId}: ${earned ? 'earned' : 'locked'}`"
          >{{ earned ? '★' : '☆' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root panel ───────────────────────────────────────────────────────────── */

.pseudocode-panel {
  position: relative;
  width: var(--panel-width);
  height: 100%;
  display: flex;
  flex-direction: row;
  /* Slide right when collapsed */
  transform: translateX(0);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.pseudocode-panel--collapsed {
  /* Push almost all the way off-screen, leaving just the tab visible (32px) */
  transform: translateX(calc(var(--panel-width) - 32px));
}

/* ── Collapse tab ─────────────────────────────────────────────────────────── */

.panel-tab {
  /* Sits on the left edge of the panel, always visible */
  position: absolute;
  left: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(
    180deg,
    var(--color-navy-light) 0%,
    var(--color-navy) 100%
  );
  border: 1px solid rgba(212, 160, 23, 0.4);
  border-right: none;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  padding: 0;
  box-shadow: -3px 0 12px rgba(0, 0, 0, 0.4);
  /* Override global button styles */
  text-transform: none;
  letter-spacing: normal;
  font-family: inherit;
  font-size: 0.6rem;
  color: var(--color-gold);
  min-height: auto;
}

.panel-tab::before {
  display: none;
}

.panel-tab:hover {
  background: linear-gradient(
    180deg,
    var(--color-navy) 0%,
    var(--color-ocean) 100%
  );
  transform: translateY(-50%);
  box-shadow: -4px 0 16px rgba(212, 160, 23, 0.25);
  color: var(--color-gold-light);
}

.panel-tab:focus-visible {
  outline: 2px solid var(--color-gold-light);
  outline-offset: 2px;
}

.panel-tab__icon {
  font-size: 0.55rem;
  line-height: 1;
}

.panel-tab__label {
  writing-mode: vertical-rl;
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
  line-height: 1;
}

/* ── Panel body ───────────────────────────────────────────────────────────── */

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    var(--color-navy-light) 0%,
    var(--color-navy) 100%
  );
}

/* ── Header ───────────────────────────────────────────────────────────────── */

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid rgba(212, 160, 23, 0.2);
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
}

.panel-header__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-header__skull {
  font-size: 1.1rem;
  opacity: 0.5;
}

.panel-header__title {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold);
  margin: 0;
  line-height: 1;
}

.panel-close-btn {
  background: transparent;
  border: 1px solid rgba(212, 160, 23, 0.3);
  color: var(--color-parchment);
  font-size: 0.65rem;
  padding: 0.2em 0.5em;
  opacity: 0.5;
  box-shadow: none;
  font-family: sans-serif;
  text-transform: none;
  letter-spacing: normal;
  min-height: auto;
  line-height: 1;
  border-radius: 3px;
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.panel-close-btn::before {
  display: none;
}

.panel-close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: none;
  box-shadow: none;
  color: var(--color-parchment);
}

/* ── Snippet area ─────────────────────────────────────────────────────────── */

.snippet-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.75rem;
  gap: 0.625rem;
}

/* ── Snippet meta (title + badge) ─────────────────────────────────────────── */

.snippet-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-shrink: 0;
}

.snippet-title {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--color-parchment);
  line-height: 1.2;
}

.concept-badge {
  font-family: var(--font-code);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2em 0.55em;
  border-radius: 20px;
  border: 1px solid currentColor;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.85;
}

.concept-badge--variables   { color: #7ecfff; }
.concept-badge--ifElse      { color: #ff9f7e; }
.concept-badge--whileLoops  { color: #b5e853; }
.concept-badge--functions   { color: #e899dc; }
.concept-badge--forLoops    { color: #ffd060; }
.concept-badge--debugging   { color: #ff7e7e; }
.concept-badge--arrays      { color: #7eff9f; }
.concept-badge--recap       { color: var(--color-gold); }

/* ── Code editor ──────────────────────────────────────────────────────────── */

.code-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  border: 1px solid rgba(212, 160, 23, 0.25);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  min-height: 0;
}

/* macOS-style chrome bar */
.code-editor__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #161b22;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.chrome-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chrome-dot--red    { background: #ff5f57; }
.chrome-dot--yellow { background: #ffbd2e; }
.chrome-dot--green  { background: #28c840; }

.chrome-filename {
  font-family: var(--font-code);
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 4px;
  letter-spacing: 0.04em;
}

.code-block {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0.5rem 0;
  font-family: 'Fira Code', var(--font-code), monospace;
  font-size: 0.72rem;
  line-height: 1.65;
  background: transparent;
}

.code-block code {
  display: block;
  font-family: inherit;
  font-size: inherit;
}

/* ── Code lines ───────────────────────────────────────────────────────────── */

.code-line {
  display: flex;
  align-items: baseline;
  padding: 0.08em 0.75rem;
  border-left: 2px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  white-space: nowrap;
}

.code-line--highlighted {
  background: rgba(212, 160, 23, 0.15);
  border-left-color: var(--color-gold);
  animation: line-pulse 1.5s ease-in-out;
}

@keyframes line-pulse {
  0% {
    background: rgba(212, 160, 23, 0.05);
    box-shadow: none;
  }
  25% {
    background: rgba(212, 160, 23, 0.28);
    box-shadow: inset 0 0 12px rgba(212, 160, 23, 0.2);
  }
  100% {
    background: rgba(212, 160, 23, 0.15);
    box-shadow: none;
  }
}

.code-line--comment .line-code {
  color: #6a8a6a;
  font-style: italic;
}

.code-line--empty {
  height: 0.75em;
}

.line-number {
  font-family: 'Fira Code', monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.18);
  min-width: 1.8rem;
  user-select: none;
  flex-shrink: 0;
  text-align: right;
  padding-right: 0.75rem;
  letter-spacing: 0;
}

.line-code {
  color: #cdd9e5;
  white-space: pre;
  font-family: 'Fira Code', monospace;
}

/* Keyword colouring — targets the first word on keyword lines */
.code-line--keyword .line-code {
  color: #e899dc;
}

/* ── Variable watch ───────────────────────────────────────────────────────── */

.var-watch {
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: var(--border-radius-sm);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 0.625rem;
  flex-shrink: 0;
}

.var-watch__title {
  font-family: var(--font-code);
  font-size: 0.6rem;
  color: var(--color-gold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.var-watch__list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.var-row {
  display: flex;
  gap: 0.4rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.71rem;
  align-items: baseline;
}

.var-row__name {
  color: #7ecfff;
}

.var-row__equals {
  color: rgba(212, 160, 23, 0.5);
}

.var-row__value {
  color: #b5e853;
}

/* ── Empty state ──────────────────────────────────────────────────────────── */

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  text-align: center;
}

.panel-empty__book {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 160, 23, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-empty__icon {
  font-size: 2rem;
  filter: grayscale(0.4);
  opacity: 0.5;
}

.panel-empty__heading {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--color-gold);
  opacity: 0.5;
  margin-bottom: 0;
}

.panel-empty__text {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--color-parchment);
  opacity: 0.35;
  line-height: 1.6;
  margin-bottom: 0;
}

/* ── Divider ──────────────────────────────────────────────────────────────── */

.panel-divider {
  height: 1px;
  margin: 0 0.875rem;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(212, 160, 23, 0.2) 20%,
    rgba(212, 160, 23, 0.2) 80%,
    transparent
  );
}

/* ── Badge shelf ──────────────────────────────────────────────────────────── */

.panel-badges {
  padding: 0.625rem 0.875rem 0.875rem;
  flex-shrink: 0;
}

.panel-badges__title {
  font-family: var(--font-code);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.45;
  margin-bottom: 0.5rem;
}

.badge-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.mini-badge {
  font-size: 1rem;
  color: var(--color-parchment);
  opacity: 0.18;
  cursor: default;
  user-select: none;
  transition:
    opacity var(--transition-fast),
    filter var(--transition-fast),
    color var(--transition-fast);
}

.mini-badge--earned {
  color: var(--color-gold);
  opacity: 1;
  filter: drop-shadow(0 0 5px rgba(212, 160, 23, 0.65));
}
</style>
