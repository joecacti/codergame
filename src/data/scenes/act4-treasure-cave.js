/**
 * Act 4 scene definitions — Treasure Cave.
 * Covers coding concepts: Arrays and the Golden Algorithm recap.
 */
export const act4Scenes = {
  'cave-entrance': {
    id: 'cave-entrance',
    background: null,
    placeholderColor: '#3a3a4a',
    placeholderLabel: 'Treasure Cave — Entrance',
    hotspots: [
      {
        id: 'cave-mouth',
        label: 'Cave Mouth',
        icon: '🕳️',
        x: 30,
        y: 20,
        width: 40,
        height: 50,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: "The cave entrance looms before ye, glowing with a golden light from deep within..." },
            { speaker: 'Narrator', text: "Inside ye can hear a strange counting sound — one, two, three, four — like an array being indexed!" },
            { speaker: 'Captain', text: "An array of treasure chests! The Golden Algorithm must be in one of them. Arrays hold many items in order, starting at index 0!" },
          ])
          helpers.showPseudocode('array_chests', { chest0: 'empty', chest1: 'coins', chest2: 'GOLDEN ALGORITHM', chest3: 'map', index: 2, length: 4 })
          helpers.setScene('cave-chests')
        },
      },
      {
        id: 'warning-sign',
        label: 'Warning Sign',
        icon: '⚠️',
        x: 10,
        y: 40,
        width: 15,
        height: 20,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Warning Sign', text: "BEWARE! The treasure chests are arranged as an ARRAY." },
            { speaker: 'Warning Sign', text: "Remember: Arrays start at INDEX 0, not 1! chests[0] is the FIRST chest. Choose wisely, Captain!" },
            { speaker: 'Captain', text: "Index 0 is the first. So four chests have indices 0, 1, 2, and 3. I must remember this!" },
          ])
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'cave-chests': {
    id: 'cave-chests',
    background: null,
    placeholderColor: '#2a2a3a',
    placeholderLabel: 'Treasure Cave — Chest Room',
    hotspots: [
      {
        id: 'chest-array',
        label: 'Array of Treasure Chests',
        icon: '📦',
        x: 10,
        y: 35,
        width: 80,
        height: 35,
        visible: true,
        action(state, helpers) {
          helpers.showPseudocode('array_chests', {
            chest0: 'empty',
            chest1: 'fool\'s gold',
            chest2: 'GOLDEN ALGORITHM',
            chest3: 'sea shells',
            index: '?',
            length: 4,
          })
          helpers.queueDialogue([
            { speaker: 'Cave Spirit', text: "Four chests stand before ye! Only one holds the Golden Algorithm. They form an array: chests = [empty, fool's gold, GOLDEN ALGORITHM, sea shells]" },
            { speaker: 'Cave Spirit', text: "Which index holds the Golden Algorithm? Remember — arrays start at 0!" },
          ])
          helpers.setFlag('showArrayPicker', true)
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'cave-treasure': {
    id: 'cave-treasure',
    background: null,
    placeholderColor: '#4a3a1a',
    placeholderLabel: 'Treasure Cave — The Golden Algorithm!',
    hotspots: [
      {
        id: 'complete-adventure',
        label: 'Complete the Adventure',
        icon: '🏆',
        x: 25,
        y: 25,
        width: 50,
        height: 45,
        visible: true,
        action(state, helpers) {
          helpers.showPseudocode('golden_algorithm')
          helpers.queueDialogue([
            { speaker: 'Golden Algorithm', text: "I AM THE GOLDEN ALGORITHM! Ye have proven thyself a true Code Pirate!" },
            {
              speaker: 'Golden Algorithm',
              text: "Ye used VARIABLES to store yer treasure, IF/ELSE to make decisions, WHILE loops to battle foes, FUNCTIONS to organize yer actions, FOR loops to count, and ARRAYS to hold yer collection!",
            },
            { speaker: 'Captain', text: "I've mastered the coding seas of the Coderibbean! But this is just the beginning of the adventure..." },
            { speaker: 'First Mate Bilgey', text: "Three cheers for the Captain! The greatest Code Pirate to ever sail these digital waters!" },
          ])
          helpers.awardBadge('arrays')
          helpers.setPhase('recap')
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },
}
