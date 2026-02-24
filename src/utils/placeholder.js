/**
 * Color map for different scene location types.
 */
export const sceneColorMap = {
  port: '#4a6741',
  bay: '#5a4a3a',
  isle: '#3a5a5a',
  cave: '#3a3a4a',
  ocean: '#2c5f7c',
}

/**
 * Returns a CSS style object for a placeholder scene background.
 * Uses a grid pattern overlay to simulate a rough placeholder look.
 *
 * @param {string} color - Background color hex string
 * @param {string} label - Display label text shown in the center
 * @returns {Object} CSS style object
 */
export function getPlaceholderStyle(color, label) {
  return {
    backgroundColor: color,
    backgroundImage: [
      'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 41px)',
      'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 41px)',
    ].join(', '),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    '--placeholder-label': JSON.stringify(label),
  }
}

/**
 * Returns placeholder label text style for overlay text.
 *
 * @returns {Object} CSS style object for the label element
 */
export function getPlaceholderLabelStyle() {
  return {
    fontFamily: "'Pirata One', cursive",
    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
    color: 'rgba(255, 255, 255, 0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
    userSelect: 'none',
  }
}
