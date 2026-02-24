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
  hull: '🛟 Hull',
  sails: '⛵ Sails',
  crew: '👥 Crew',
  anchor: '⚓ Anchor',
}

export const FUNNY_MESSAGES = {
  sails: "Fish for sails?! 🐟 Not how boats work!",
  hull: "A hull of ZERO? She'll sink instantly!",
  crew: "Negative five crew? Less than nobody! 😂",
  anchor: '"Maybe" won\'t hold us in place!',
}

export const GOOD_MESSAGES = {
  hull: 'Solid oak hull! 💪',
  sails: 'Three sails! Catch every breeze! 🌬️',
  crew: 'A crew of 12! Ready to sail! 👏',
  anchor: 'Anchor set to true! ⚓',
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
