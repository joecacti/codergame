/**
 * Act 3 scene definitions — Isle of Riddles.
 * Covers coding concepts: FOR Loops and Debugging.
 */
export const act3Scenes = {
  'isle-gate': {
    id: 'isle-gate',
    background: null,
    placeholderColor: '#3a5a5a',
    placeholderLabel: 'Isle of Riddles — Gate',
    hotspots: [
      {
        id: 'stone-tablet',
        label: 'Stone Tablet',
        icon: '🗿',
        x: 30,
        y: 30,
        width: 20,
        height: 30,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Stone Tablet', text: 'CARVED IN ANCIENT RUNES: The FOR loop counts from start to end, visiting each number in turn.' },
            { speaker: 'Stone Tablet', text: 'FOR i = 1 TO 5 DO: total = total + i. The loop runs 5 times, once for each number 1 through 5.' },
            { speaker: 'Captain', text: "So a FOR loop is perfect when ye know exactly how many times to repeat! Unlike a WHILE loop, it counts for ye!" },
          ])
          helpers.showPseudocode('for_loop_riddle', { count: 5, answer: 15 })
        },
      },
      {
        id: 'riddle-door',
        label: 'Riddle Door',
        icon: '🚪',
        x: 55,
        y: 20,
        width: 25,
        height: 60,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Ancient Door', text: "BOOM... BOOM... I am the Riddle Door. Only those who can count with a FOR loop may pass. Solve my counting puzzle!" },
          ])
          helpers.showPseudocode('for_loop_riddle', { count: 5, answer: 15 })
          helpers.setFlag('showRiddle', true)
        },
      },
      {
        id: 'mysterious-runes',
        label: 'Mysterious Runes',
        icon: '✨',
        x: 10,
        y: 50,
        width: 12,
        height: 20,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: "Strange runes cover the cliff face. You can make out fragments... 'Here sailed the Code Pirates of Old...' " },
            { speaker: 'Narrator', text: "'They counted treasures with FOR loops and tracked their voyages in arrays. The Golden Algorithm was their greatest discovery.'" },
            { speaker: 'Captain', text: "Code Pirates! So this has been a journey of coders before me. I must follow in their footsteps!" },
          ])
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'isle-temple': {
    id: 'isle-temple',
    background: null,
    placeholderColor: '#2a4a4a',
    placeholderLabel: 'Isle Temple',
    hotspots: [
      {
        id: 'broken-mechanism',
        label: 'Broken Mechanism',
        icon: '⚙️',
        x: 40,
        y: 40,
        width: 20,
        height: 25,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: "An ancient mechanism in the temple wall is broken! Gears are stuck, and numbers are wrong everywhere..." },
            { speaker: 'Narrator', text: "Someone set amount = 999 when it should be amount = 42. The whole mechanism is bugged!" },
            { speaker: 'Captain', text: "This is a debugging challenge! I need to find the bug and fix it. Let me read the code carefully..." },
          ])
          helpers.showPseudocode('debug_intro', { wrongAmount: 999, rightAmount: 42 })
          helpers.setFlag('showDebug', true)
        },
      },
      {
        id: 'crystal-ball',
        label: 'Crystal Ball',
        icon: '🔮',
        x: 70,
        y: 30,
        width: 12,
        height: 15,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Crystal Ball', text: "I see... the Treasure Cave... deep within Gary's Island... past this temple lies the cave entrance..." },
            { speaker: 'Crystal Ball', text: "The Golden Algorithm is stored in an ARRAY of four treasure chests. Choose the right index and the treasure is yours!" },
            { speaker: 'Captain', text: "Arrays... I'll need to remember that they start at index 0. Four chests means indices 0, 1, 2, and 3." },
          ])
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'isle-victory': {
    id: 'isle-victory',
    background: null,
    placeholderColor: '#1e3a3a',
    placeholderLabel: 'Isle of Riddles — Solved!',
    hotspots: [
      {
        id: 'continue-to-act4',
        label: 'Continue to Treasure Cave',
        icon: '🏆',
        x: 25,
        y: 30,
        width: 50,
        height: 35,
        visible: true,
        action(state, helpers) {
          if (state.flags.riddleSolved) {
            helpers.awardBadge('forLoops')
          }
          if (state.flags.debugSolved) {
            // Debugging concept — no dedicated badge defined, but flag is tracked
          }
          helpers.queueDialogue([
            { speaker: 'First Mate Bilgey', text: "Cap'n, ye've solved the riddles of the Isle! The path to the Treasure Cave is open!" },
            { speaker: 'Captain', text: "FOR loops, debugging — I've learned them all! Now to find Captain Gary and the Golden Algorithm!" },
          ])
          helpers.setAct(4)
        },
      },
    ],
    onEnter(state) {
      if (state.flags.riddleSolved) {
        // Badge will be awarded when the continue hotspot is clicked
      }
    },
  },
}
