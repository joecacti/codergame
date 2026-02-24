/**
 * Act 1 scene definitions — Port Compile.
 * Covers coding concepts: Variables and IF/ELSE decisions.
 */
export const act1Scenes = {
  'port-arrival': {
    id: 'port-arrival',
    background: null,
    placeholderColor: '#4a6741',
    placeholderLabel: 'Port Compile',
    hotspots: [
      {
        id: 'wooden-crate',
        label: 'Wooden Crate',
        icon: '📦',
        x: 10,
        y: 60,
        width: 15,
        height: 25,
        visible: (state) => !state.flags.searchedCrate,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: 'Ye search the old wooden crate with yer cutlass...' },
            { speaker: 'Narrator', text: "Inside ye find 10 gold coins! In code, we'd write: pirateGold = 10" },
            { speaker: 'Captain', text: 'Variables are like treasure chests for data. I stored that gold in a variable called pirateGold!' },
          ])
          helpers.adjustStat('gold', 10)
          helpers.setFlag('searchedCrate', true)
          helpers.showPseudocode('variables_intro', { gold: 10, health: 100, hasMap: false })
          helpers.awardBadge('variables')
        },
      },
      {
        id: 'old-parrot',
        label: 'Old Parrot',
        icon: '🦜',
        x: 70,
        y: 30,
        width: 12,
        height: 20,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Polly', text: 'SQUAWK! Captain Gary! Captain Gary sailed to a secret island! SQUAWK!' },
            { speaker: 'Polly', text: "SQUAWK! I remember things like a variable! islandName = 'Gary's Island'! SQUAWK!" },
            { speaker: 'Polly', text: 'SQUAWK! Check the notice board! A wanted poster for Captain Gary! SQUAWK!' },
          ])
        },
      },
      {
        id: 'notice-board',
        label: 'Notice Board',
        icon: '📋',
        x: 40,
        y: 20,
        width: 15,
        height: 30,
        visible: true,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: 'A weathered notice board covered in parchment. One poster stands out above the rest...' },
            {
              speaker: 'Poster',
              text: "WANTED: Captain Gary the Coder! Last seen sailing toward the Isle of the Golden Algorithm with a treasure map. REWARD: 100 gold!",
            },
            { speaker: 'Captain', text: "So Captain Gary has a treasure map to the Golden Algorithm. I must find my own map and follow him!" },
          ])
          helpers.setFlag('readPoster', true)
        },
      },
      {
        id: 'ship-at-dock',
        label: 'Ship at Dock',
        icon: '⚓',
        x: 75,
        y: 55,
        width: 20,
        height: 35,
        visible: true,
        action(state, helpers) {
          if (!state.inventory.includes('map')) {
            helpers.queueDialogue([
              { speaker: 'First Mate Bilgey', text: "Ahoy, Captain! Ye need a map first! We can't sail without knowing where we're headed!" },
              { speaker: 'First Mate Bilgey', text: "The treasure map was spotted in the shop down the dock. Ask the shopkeeper — maybe they'll trade!" },
            ])
          } else {
            helpers.showPseudocode('if_else_sail', { hasMap: true })
            helpers.showChoices([
              {
                id: 'sail-choice',
                text: 'Sail to Skeleton Bay',
                action(h) {
                  h.awardBadge('ifElse')
                  h.queueDialogue([
                    { speaker: 'First Mate Bilgey', text: 'Aye aye, Captain! We set sail for Skeleton Bay! The IF branch is true — map in hand, adventure ahead!' },
                    { speaker: 'Captain', text: 'IF hasMap == true THEN sail! And sail we shall!' },
                  ])
                  h.setFlag('sailedToAct2', true)
                  h.setScene('port-decision')
                },
              },
              {
                id: 'explore-more',
                text: 'Explore Port Compile more',
                action(h) {
                  h.queueDialogue([
                    { speaker: 'Captain', text: "We have the map, but I want to explore more of Port Compile. The ELSE branch — we stay and gather more resources." },
                  ])
                },
              },
            ])
          }
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'port-shop': {
    id: 'port-shop',
    background: null,
    placeholderColor: '#5c6b41',
    placeholderLabel: 'Port Shop',
    hotspots: [
      {
        id: 'shopkeeper',
        label: 'Shopkeeper',
        icon: '🧑‍💼',
        x: 40,
        y: 30,
        width: 15,
        height: 35,
        visible: true,
        action(state, helpers) {
          if (state.player.gold >= 5) {
            helpers.showChoices([
              {
                id: 'buy-compass',
                text: 'Buy compass for 5 gold',
                action(h) {
                  if (state.player.gold >= 5) {
                    h.adjustStat('gold', -5)
                    h.addItem('compass')
                    h.queueDialogue([
                      { speaker: 'Shopkeeper', text: 'Pleasure doin business, Captain! One compass for 5 gold coins.' },
                      { speaker: 'Narrator', text: 'In code that would be: pirateGold = pirateGold - 5. Variables can be changed!' },
                    ])
                    h.showPseudocode('variables_intro', { gold: state.player.gold, health: state.player.health, hasMap: state.inventory.includes('map') })
                  } else {
                    h.showDialogue('Shopkeeper', "Arrr, ye don't have enough gold! Come back when ye've found some.")
                  }
                },
              },
              {
                id: 'decline-compass',
                text: 'No thanks',
                action(h) {
                  h.showDialogue('Shopkeeper', 'Suit yerself, Captain. The offer stands if ye change yer mind.')
                },
              },
            ])
          } else {
            helpers.queueDialogue([
              { speaker: 'Shopkeeper', text: "Welcome to me shop, Captain! I've got a fine compass for 5 gold." },
              { speaker: 'Shopkeeper', text: "Though by the look of ye, ye might be a bit short on coin. Search around the port — there's gold to be found!" },
            ])
          }
        },
      },
      {
        id: 'treasure-map',
        label: 'Treasure Map',
        icon: '🗺️',
        x: 70,
        y: 60,
        width: 12,
        height: 15,
        visible: (state) => !state.flags.hasMap,
        action(state, helpers) {
          helpers.queueDialogue([
            { speaker: 'Narrator', text: 'A rolled-up parchment map sits on the shelf. It shows a route to... Skeleton Bay and beyond!' },
            { speaker: 'Shopkeeper', text: "Take it, Captain! I found it washed ashore. The map to Gary's Island — hasMap = true now!" },
          ])
          helpers.addItem('map')
          helpers.setFlag('hasMap', true)
        },
      },
      {
        id: 'back-to-port',
        label: 'Back to Port',
        icon: '🚪',
        x: 5,
        y: 80,
        width: 10,
        height: 15,
        visible: true,
        action(state, helpers) {
          helpers.setScene('port-arrival')
        },
      },
    ],
    onEnter(state) {
      // No automatic actions on entering this scene
    },
  },

  'port-decision': {
    id: 'port-decision',
    background: null,
    placeholderColor: '#3d5c38',
    placeholderLabel: 'The Docks — Set Sail?',
    hotspots: [
      {
        id: 'captain-decision',
        label: 'Make Your Decision',
        icon: '🧭',
        x: 30,
        y: 30,
        width: 40,
        height: 40,
        visible: true,
        action(state, helpers) {
          helpers.showPseudocode('if_else_sail', { hasMap: state.inventory.includes('map') })
          helpers.showChoices([
            {
              id: 'sail-now',
              text: 'Sail to Skeleton Bay — adventure awaits!',
              action(h) {
                h.awardBadge('ifElse')
                h.queueDialogue([
                  { speaker: 'First Mate Bilgey', text: 'All hands on deck! We sail for Skeleton Bay!' },
                  { speaker: 'Captain', text: 'IF hasMap == true THEN SAIL — and our map says we go to Skeleton Bay!' },
                ])
                h.setFlag('sailedToAct2', true)
                h.setAct(2)
              },
            },
            {
              id: 'back-to-explore',
              text: 'Return to port — explore more first',
              action(h) {
                h.queueDialogue([
                  { speaker: 'Captain', text: 'ELSE — we explore more of Port Compile. Every choice leads somewhere!' },
                ])
                h.setScene('port-arrival')
              },
            },
          ])
        },
      },
    ],
    onEnter(state) {
      // Choices are triggered by hotspot interaction
    },
  },
}
