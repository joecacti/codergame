export const OBSTACLES = [
  {
    emoji: '🪨', name: 'Rock', pos: 'left',
    prompt: 'A huge rock ahead on the LEFT! Complete the code to dodge:',
    code: 'if (obstacle === "rock") {\n  ship.steer(___)\n}',
    options: ['"right"', '"left"', '"stop"'], correct: 0,
  },
  {
    emoji: '🌀', name: 'Whirlpool', pos: 'right',
    prompt: 'A whirlpool swirling on the RIGHT! Complete the code:',
    code: 'if (obstacle === "whirlpool") {\n  ship.steer(___)\n}',
    options: ['"right"', '"left"', '"into it"'], correct: 1,
  },
  {
    emoji: '🧊', name: 'Iceberg', pos: 'left',
    prompt: 'An iceberg dead ahead on the LEFT! Complete the code:',
    code: 'if (obstacle === "iceberg") {\n  ship.steer(___)\n}',
    options: ['"stop"', '"left"', '"right"'], correct: 2,
  },
  {
    emoji: '🐙', name: 'Kraken Tentacle', pos: 'right',
    prompt: 'A Kraken tentacle reaching from the RIGHT! Complete the code:',
    code: 'if (obstacle === "kraken") {\n  ship.steer(___)\n}',
    options: ['"right"', '"faster"', '"left"'], correct: 2,
  },
  {
    emoji: '🏴‍☠️', name: 'Enemy Ship', pos: 'left',
    prompt: 'An enemy pirate ship approaching from the LEFT! Complete the code:',
    code: 'if (obstacle === "enemy") {\n  ship.steer(___)\n}',
    options: ['"left"', '"right"', '"surrender"'], correct: 1,
  },
  {
    emoji: '⚡', name: 'Storm', pos: 'right',
    prompt: 'A lightning storm raging on the RIGHT! Complete the code:',
    code: 'if (obstacle === "storm") {\n  ship.steer(___)\n}',
    options: ['"through it"', '"right"', '"left"'], correct: 2,
  },
  {
    emoji: '🌊', name: 'Giant Wave', pos: 'left',
    prompt: 'A massive wave crashing from the LEFT! Complete the code:',
    code: 'if (obstacle === "wave") {\n  ship.steer(___)\n}',
    options: ['"right"', '"duck"', '"left"'], correct: 0,
  },
  {
    emoji: '🦈', name: 'Shark Pack', pos: 'right',
    prompt: 'Sharks circling on the RIGHT! Complete the code:',
    code: 'if (obstacle === "sharks") {\n  ship.steer(___)\n}',
    options: ['"right"', '"left"', '"feed them"'], correct: 1,
  },
]
