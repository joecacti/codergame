/**
 * Act 2 scene definitions — Skeleton Bay.
 * Covers coding concepts: WHILE Loops and Functions.
 */
export const act2Scenes = {
  'bay-shore': {
    id: 'bay-shore',
    background: null,
    placeholderColor: '#5a4a3a',
    placeholderLabel: 'Skeleton Bay',
    hotspots: [
      {
        id: 'ghost-ship',
        label: 'Ghost Ship',
        icon: '👻',
        x: 60,
        y: 20,
        width: 25,
        height: 40,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: 'A spectral vessel floats just offshore, glowing an eerie green. The Ghost Captain blocks the path to the inner bay...' },
            { speaker: 'Ghost Captain', text: "WHOOOOO... Halt, mortal! I am Captain Nullpointer, cursed to sail these waters WHILE my loop condition remains true!" },
            { speaker: 'Ghost Captain', text: "Only someone who truly understands loops can break my curse! Will ye challenge me?" },
            { speaker: 'Captain', text: "A ghost bound by a WHILE loop... I've seen stranger bugs in my time. We need to find a way past him." },
          ])
        },
      },
      {
        id: 'ancient-cannon',
        label: 'Ancient Cannon',
        icon: '💣',
        x: 15,
        y: 60,
        width: 18,
        height: 20,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: "An ancient cannon sits on the shore, still polished despite its age. A plaque reads: FUNCTION fireCannon(target)" },
            { speaker: 'Narrator', text: "The cannon is a FUNCTION — a reusable action! Give it a target, it fires. Simple, powerful, and ready to call!" },
            { speaker: 'Captain', text: "Brilliant! This cannon function could help us deal with that ghost. I'll store this knowledge — hasCannon = true!" },
          ])
          helpers.showPseudocode('function_intro')
          helpers.awardBadge('functions')
          helpers.setFlag('hasCannon', true)
        },
      },
      {
        id: 'skeleton-crew',
        label: 'Skeleton Crew',
        icon: '💀',
        x: 35,
        y: 50,
        width: 15,
        height: 25,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Skeleton Crewmate', text: "RATTLE RATTLE... Welcome, Captain! We've been waiting for someone to help us!" },
            { speaker: 'Skeleton Crewmate', text: "That Ghost Captain Nullpointer has three weaknesses. Ye can fight him in a WHILE loop battle, tell him a riddle to confuse his logic, or use the cannon function!" },
          ])
          helpers.showChoices([
            {
              id: 'go-encounter',
              text: 'Approach the Ghost Captain',
              action(h) {
                h.setScene('bay-encounter')
              },
            },
            {
              id: 'stay-shore',
              text: 'Stay and prepare more',
              action(h) {
                h.queueDialogue([
                  { speaker: 'Skeleton Crewmate', text: 'RATTLE RATTLE... Wise choice! Explore the shore a bit more first!' },
                ])
              },
            },
          ])
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'bay-encounter': {
    id: 'bay-encounter',
    background: null,
    placeholderColor: '#3d2e1e',
    placeholderLabel: 'Ghost Encounter',
    hotspots: [
      {
        id: 'ghost-challenge',
        label: 'Face the Ghost Captain',
        icon: '⚔️',
        x: 25,
        y: 20,
        width: 50,
        height: 55,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Ghost Captain', text: "WHOOOOO... So ye dare to face me! I repeat this challenge WHILE ye stand before me! Choose yer method, mortal!" },
          ])
          const choices = [
            {
              id: 'fight-ghost',
              text: 'Fight the ghost! (WHILE Loop Battle)',
              action(h) {
                h.queueDialogue([
                  { speaker: 'Captain', text: 'I choose to fight! A WHILE loop battle it is!' },
                  { speaker: 'Narrator', text: 'WHILE ghost.health > 0: attack! The combat loop begins!' },
                ])
                h.showPseudocode('while_combat', { damage: 10 })
                h.setFlag('showCombat', true)
              },
            },
            {
              id: 'riddle-ghost',
              text: 'Tell a riddle to confuse his logic',
              action(h) {
                h.queueDialogue([
                  { speaker: 'Captain', text: 'I have a riddle for ye, ghost! What has a beginning and an end but runs forever?' },
                  { speaker: 'Ghost Captain', text: "Errr... WHOOOO... A... loop? No wait... that CAN'T run forever or it's a bug..." },
                  { speaker: 'Ghost Captain', text: "WHOOOO! Me logic circuits! They're overloading! Ye found the infinite loop paradox! I yield, mortal!" },
                  { speaker: 'Narrator', text: "The ghost laughs and steps aside, impressed by your logical thinking. +20 reputation!" },
                ])
                h.adjustStat('reputation', 20)
                h.awardBadge('whileLoops')
                h.setScene('bay-victory')
              },
            },
          ]
          if (state.flags.hasCannon) {
            choices.push({
              id: 'cannon-ghost',
              text: 'Fire the cannon function! (hasCannon required)',
              action(h) {
                h.queueDialogue([
                  { speaker: 'Captain', text: 'fireCannon(ghost)! I call the function!' },
                  { speaker: 'Narrator', text: "The ancient cannon BOOMS. The function executes perfectly: damage = 20, ghost.health = ghost.health - 20!" },
                  { speaker: 'Ghost Captain', text: "WHOOOOO! A function call! Well played, mortal... I cannot argue with proper syntax! Ye may pass!" },
                ])
                h.showPseudocode('function_intro')
                h.awardBadge('whileLoops')
                h.setScene('bay-victory')
              },
            })
          }
          helpers.showChoices(choices)
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'bay-victory': {
    id: 'bay-victory',
    background: null,
    placeholderColor: '#2e4a3a',
    placeholderLabel: 'Skeleton Bay — Victory!',
    hotspots: [
      {
        id: 'continue-to-act3',
        label: 'Continue to Isle of Riddles',
        icon: '🗺️',
        x: 30,
        y: 35,
        width: 40,
        height: 30,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'First Mate Bilgey', text: "Brilliant work, Captain! The ghost is gone and the path to the Isle of Riddles lies open!" },
            { speaker: 'Captain', text: "Onward to the Isle of Riddles! The Golden Algorithm awaits!" },
          ])
          helpers.setAct(3)
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },
}
