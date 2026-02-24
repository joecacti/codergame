/**
 * Act definitions for Pirates of the Coderibbean.
 * Each act covers specific coding concepts taught through gameplay.
 */
export const acts = [
  {
    id: 1,
    title: 'Port Compile',
    subtitle: 'Variables & Decisions',
    description:
      'Ye have arrived at Port Compile, a bustling harbour town. Speak to the locals, trade goods, and learn the ancient art of storing values in variables. Make your first decisions — the code decides your fate!',
    concepts: ['variables', 'ifElse'],
    startScene: 'port-arrival',
    color: '#4a6741',
  },
  {
    id: 2,
    title: 'Skeleton Bay',
    subtitle: 'Loops & Functions',
    description:
      "The cursed Skeleton Bay awaits. Ghostly sailors repeat their tasks endlessly — learn to harness the power of loops to command them. Bundle your code into functions and sail on with purpose!",
    concepts: ['whileLoops', 'functions'],
    startScene: 'skeleton-bay',
    color: '#5a4a3a',
  },
  {
    id: 3,
    title: 'Isle of Riddles',
    subtitle: 'Counting & Debugging',
    description:
      "A mysterious island shrouded in fog. The riddle-masters here speak only in numbers and logic. Master the for loop, count your way through puzzles, and learn to debug when things go wrong!",
    concepts: ['forLoops', 'debugging'],
    startScene: 'isle-of-riddles',
    color: '#3a5a5a',
  },
  {
    id: 4,
    title: 'Treasure Cave',
    subtitle: 'Arrays & The Golden Algorithm',
    description:
      "Deep within Gary's Island lies the Treasure Cave. The legendary Golden Algorithm is hidden among collections of priceless data. Master arrays to unlock the ultimate treasure!",
    concepts: ['arrays'],
    startScene: 'treasure-cave',
    color: '#3a3a4a',
  },
]

/**
 * Returns a single act by its numeric ID.
 *
 * @param {number} id
 * @returns {Object|undefined}
 */
export function getAct(id) {
  return acts.find((act) => act.id === id)
}
