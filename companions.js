// Companion planting rules — high-confidence pairings only.
// Each rule has a stable ID; never rename an ID once shipped (save files may reference it).
// Future extensions: disabledRules[] and customRules[] in the save file (see project notes).

const COMPANIONS = [
  // ── Good pairings ──────────────────────────────────────────────────────────

  { id: 'tomato-basil',           plants: ['tomato', 'basil'],          type: 'good', reason: 'Basil repels aphids and whiteflies from tomatoes' },
  { id: 'tomato-marigold',        plants: ['tomato', 'marigold'],        type: 'good', reason: 'Marigolds deter nematodes and aphids' },
  { id: 'tomato-nasturtium',      plants: ['tomato', 'nasturtium'],      type: 'good', reason: 'Nasturtiums act as a trap crop for aphids' },

  { id: 'carrot-onion',           plants: ['carrot', 'onion'],           type: 'good', reason: 'Each repels the other\'s main pest (carrot fly / onion fly)' },
  { id: 'carrot-leek',            plants: ['carrot', 'leek'],            type: 'good', reason: 'Leeks deter carrot fly; carrots deter leek moth' },
  { id: 'carrot-chives',          plants: ['carrot', 'chives'],          type: 'good', reason: 'Chives repel carrot fly' },
  { id: 'carrot-rosemary',        plants: ['carrot', 'rosemary'],        type: 'good', reason: 'Rosemary repels carrot fly' },
  { id: 'carrot-peas',            plants: ['carrot', 'peas'],            type: 'good', reason: 'Classic companions with compatible root depths' },
  { id: 'carrot-bush-beans',      plants: ['carrot', 'bush_beans'],      type: 'good', reason: 'Beans fix nitrogen; carrots loosen soil' },
  { id: 'carrot-pole-beans',      plants: ['carrot', 'pole_beans'],      type: 'good', reason: 'Beans fix nitrogen; carrots loosen soil' },

  { id: 'broccoli-nasturtium',    plants: ['broccoli', 'nasturtium'],    type: 'good', reason: 'Nasturtiums trap aphids away from brassicas' },
  { id: 'cabbage-nasturtium',     plants: ['cabbage', 'nasturtium'],     type: 'good', reason: 'Nasturtiums trap aphids away from brassicas' },
  { id: 'cauliflower-nasturtium', plants: ['cauliflower', 'nasturtium'], type: 'good', reason: 'Nasturtiums trap aphids away from brassicas' },
  { id: 'kale-nasturtium',        plants: ['kale', 'nasturtium'],        type: 'good', reason: 'Nasturtiums trap aphids away from brassicas' },

  { id: 'cucumber-nasturtium',    plants: ['cucumber', 'nasturtium'],    type: 'good', reason: 'Nasturtiums repel cucumber beetles' },
  { id: 'cucumber-marigold',      plants: ['cucumber', 'marigold'],      type: 'good', reason: 'Marigolds deter cucumber beetles' },
  { id: 'zucchini-nasturtium',    plants: ['zucchini', 'nasturtium'],    type: 'good', reason: 'Nasturtiums repel squash pests' },
  { id: 'pumpkin-nasturtium',     plants: ['pumpkin', 'nasturtium'],     type: 'good', reason: 'Nasturtiums repel squash pests' },

  { id: 'peas-radish',            plants: ['peas', 'radish'],            type: 'good', reason: 'Radishes deter pea aphids' },
  { id: 'radish-spinach',         plants: ['radish', 'spinach'],         type: 'good', reason: 'Radishes loosen soil, benefiting spinach roots' },
  { id: 'radish-lettuce-leaf',    plants: ['radish', 'lettuce_leaf'],    type: 'good', reason: 'Radishes loosen soil and mark lettuce rows' },
  { id: 'radish-lettuce-head',    plants: ['radish', 'lettuce_head'],    type: 'good', reason: 'Radishes loosen soil and mark lettuce rows' },

  { id: 'marigold-pepper',        plants: ['marigold', 'pepper'],        type: 'good', reason: 'Marigolds deter aphids and nematodes' },
  { id: 'marigold-eggplant',      plants: ['marigold', 'eggplant'],      type: 'good', reason: 'Marigolds deter nematodes' },

  { id: 'spinach-strawberry',     plants: ['spinach', 'strawberry'],     type: 'good', reason: 'Spinach provides beneficial ground cover for strawberries' },

  // ── Bad pairings ───────────────────────────────────────────────────────────

  // Alliums stunt legumes (very high confidence)
  { id: 'onion-bush-beans',       plants: ['onion', 'bush_beans'],       type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'onion-pole-beans',       plants: ['onion', 'pole_beans'],       type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'onion-peas',             plants: ['onion', 'peas'],             type: 'bad', reason: 'Alliums inhibit pea growth' },
  { id: 'garlic-bush-beans',      plants: ['garlic', 'bush_beans'],      type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'garlic-pole-beans',      plants: ['garlic', 'pole_beans'],      type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'garlic-peas',            plants: ['garlic', 'peas'],            type: 'bad', reason: 'Alliums inhibit pea growth' },
  { id: 'leek-bush-beans',        plants: ['leek', 'bush_beans'],        type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'leek-pole-beans',        plants: ['leek', 'pole_beans'],        type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'leek-peas',              plants: ['leek', 'peas'],              type: 'bad', reason: 'Alliums inhibit pea growth' },
  { id: 'chives-bush-beans',      plants: ['chives', 'bush_beans'],      type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'chives-pole-beans',      plants: ['chives', 'pole_beans'],      type: 'bad', reason: 'Alliums inhibit bean growth' },
  { id: 'chives-peas',            plants: ['chives', 'peas'],            type: 'bad', reason: 'Alliums inhibit pea growth' },

  // Brassicas vs tomatoes (very high confidence)
  { id: 'broccoli-tomato',        plants: ['broccoli', 'tomato'],        type: 'bad', reason: 'Brassicas and tomatoes compete heavily and stunt each other' },
  { id: 'cabbage-tomato',         plants: ['cabbage', 'tomato'],         type: 'bad', reason: 'Brassicas and tomatoes compete heavily and stunt each other' },
  { id: 'cauliflower-tomato',     plants: ['cauliflower', 'tomato'],     type: 'bad', reason: 'Brassicas and tomatoes compete heavily and stunt each other' },
  { id: 'kale-tomato',            plants: ['kale', 'tomato'],            type: 'bad', reason: 'Brassicas and tomatoes compete heavily and stunt each other' },
];

// Build a fast lookup: "plantA|plantB" → rule (both orderings)
const COMPANION_MAP = {};
for (const rule of COMPANIONS) {
  const [a, b] = rule.plants;
  COMPANION_MAP[`${a}|${b}`] = rule;
  COMPANION_MAP[`${b}|${a}`] = rule;
}

function findCompanionRule(plantA, plantB) {
  return COMPANION_MAP[`${plantA}|${plantB}`] || null;
}
