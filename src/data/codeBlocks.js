export const CORRECT = {
  sails: 'let sails = 3',
  hull: 'let hull = "oak"',
  crew: 'let crew = 12',
  anchor: 'let anchor = true',
}

export const DISTRACTORS = [
  'let sails = "fish"',
  'let hull = 0',
  'let crew = -5',
  'let anchor = "maybe"',
]

export const SLOTS = ['hull', 'sails', 'crew', 'anchor']

export const SLOT_LABELS = {
  hull: '\u{1F6DF} Hull',
  sails: '\u26F5 Sails',
  crew: '\u{1F465} Crew',
  anchor: '\u2693 Anchor',
}

export const FUNNY_MESSAGES = {
  sails: "Fish for sails?! \u{1F41F} Not how boats work!",
  hull: "A hull of ZERO? She'll sink instantly!",
  crew: "Negative five crew? Less than nobody! \u{1F602}",
  anchor: '"Maybe" won\'t hold us in place!',
}

export const GOOD_MESSAGES = {
  hull: 'Solid oak hull! \u{1F4AA}',
  sails: 'Three sails! Catch every breeze! \u{1F32C}\uFE0F',
  crew: 'A crew of 12! Ready to sail! \u{1F44F}',
  anchor: 'Anchor set to true! \u2693',
}

export const WRONG_EXPLANATIONS = {
  sails: 'Sails need a NUMBER \u2014 how many sails does a ship have? "fish" is text, not a count!',
  hull: 'A hull needs to be a MATERIAL (text like "oak"), not the number 0. Zero wood = no boat!',
  crew: 'You can\'t have -5 crew members! A crew needs a POSITIVE number of real people.',
  anchor: 'An anchor is either DOWN (true) or UP (false). "maybe" is text \u2014 anchors don\'t do "maybe"!',
}

export const HINTS = {
  hull: [
    'Think about what TYPE of value a hull needs \u2014 a material name or a number?',
    'The hull is made of a material \u2014 that\'s text (a String), in quotes!',
    'Try: let hull = "oak"',
  ],
  sails: [
    'How many sails does a ship need? Think about the TYPE \u2014 text or number?',
    'Sails are counted \u2014 you need a Number, not text in quotes!',
    'Try: let sails = 3',
  ],
  crew: [
    'A crew is a group of people. What TYPE of value makes sense?',
    'You need a POSITIVE number \u2014 you can\'t have negative crew!',
    'Try: let crew = 12',
  ],
  anchor: [
    'An anchor is either down or up. What TYPE has only two options?',
    'This needs a Boolean \u2014 true or false, no quotes!',
    'Try: let anchor = true',
  ],
}

export const CODE_BREAKDOWNS = {
  hull: {
    parts: [
      { text: 'let', type: 'keyword', meaning: 'Create a new variable (a named box)' },
      { text: 'hull', type: 'variable', meaning: 'The name of the box \u2014 "hull"' },
      { text: '=', type: 'operator', meaning: 'Put this value inside the box' },
      { text: '"oak"', type: 'string', meaning: 'The value: a piece of text (String)' },
    ],
  },
  sails: {
    parts: [
      { text: 'let', type: 'keyword', meaning: 'Create a new variable' },
      { text: 'sails', type: 'variable', meaning: 'The name \u2014 "sails"' },
      { text: '=', type: 'operator', meaning: 'Assign this value' },
      { text: '3', type: 'number', meaning: 'The value: a Number' },
    ],
  },
  crew: {
    parts: [
      { text: 'let', type: 'keyword', meaning: 'Create a new variable' },
      { text: 'crew', type: 'variable', meaning: 'The name \u2014 "crew"' },
      { text: '=', type: 'operator', meaning: 'Assign this value' },
      { text: '12', type: 'number', meaning: 'The value: a Number' },
    ],
  },
  anchor: {
    parts: [
      { text: 'let', type: 'keyword', meaning: 'Create a new variable' },
      { text: 'anchor', type: 'variable', meaning: 'The name \u2014 "anchor"' },
      { text: '=', type: 'operator', meaning: 'Assign this value' },
      { text: 'true', type: 'boolean', meaning: 'The value: a Boolean (yes/no)' },
    ],
  },
}

export const FAKE_PLAYERS = [
  { initials: 'AJ', level: 2, badges: 5, time: '4:32' },
  { initials: 'KM', level: 2, badges: 4, time: '5:10' },
  { initials: 'ZR', level: 1, badges: 3, time: '3:45' },
  { initials: 'LP', level: 1, badges: 2, time: '6:20' },
  { initials: 'TS', level: 1, badges: 1, time: '2:15' },
]

export function shuffle(arr) {
  const b = [...arr]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
