// Lightweight per-food macro estimator.
// Instead of expanding 400+ DB entries by hand, we classify a food by name keywords
// and split its kcal into protein/carb/fat using category ratios. Fiber/sugar/sodium
// are derived heuristically from the same category. Values are intentionally
// approximate — "good enough for awareness", not clinical.

export interface Macros {
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
  sugar: number;   // grams
  sodium: number;  // mg
}

type Category =
  | 'protein'      // chicken, egg, fish, paneer, dal, tofu
  | 'grain'        // rice, roti, bread, pasta, dosa, oats
  | 'fried'        // samosa, pakora, fries, chips
  | 'sweet'        // cake, ice cream, chocolate, gulab jamun
  | 'fruit'        // banana, apple
  | 'veg'          // sabzi, salad
  | 'dairy'        // milk, lassi, yogurt
  | 'drink_sugar'  // coke, juice, sweet lassi
  | 'drink_plain'  // tea, coffee, water
  | 'mixed';       // biryani, pizza, burger, sandwich — default

// Per-category split: { protein%, carb%, fat% } of total calories (must sum ~1).
// Plus fiber-g-per-100kcal, sugar-g-per-100kcal, sodium-mg-per-100kcal.
const PROFILE: Record<Category, {
  p: number; c: number; f: number;
  fiber: number; sugar: number; sodium: number;
}> = {
  protein:     { p: 0.45, c: 0.10, f: 0.45, fiber: 0.5, sugar: 0.5, sodium: 80 },
  grain:       { p: 0.10, c: 0.78, f: 0.12, fiber: 1.5, sugar: 1.0, sodium: 60 },
  fried:       { p: 0.08, c: 0.42, f: 0.50, fiber: 0.8, sugar: 1.0, sodium: 180 },
  sweet:       { p: 0.05, c: 0.60, f: 0.35, fiber: 0.3, sugar: 10,  sodium: 40 },
  fruit:       { p: 0.04, c: 0.94, f: 0.02, fiber: 3.0, sugar: 12,  sodium: 1 },
  veg:         { p: 0.18, c: 0.50, f: 0.32, fiber: 4.0, sugar: 3.0, sodium: 120 },
  dairy:       { p: 0.22, c: 0.40, f: 0.38, fiber: 0,   sugar: 6,   sodium: 50 },
  drink_sugar: { p: 0.02, c: 0.96, f: 0.02, fiber: 0,   sugar: 12,  sodium: 10 },
  drink_plain: { p: 0.10, c: 0.50, f: 0.40, fiber: 0,   sugar: 1,   sodium: 5 },
  mixed:       { p: 0.18, c: 0.50, f: 0.32, fiber: 1.5, sugar: 2.0, sodium: 120 },
};

const KEYWORDS: Array<[Category, RegExp]> = [
  ['drink_plain', /\b(black coffee|green tea|tea|coffee|water|jaljeera)\b/],
  ['drink_sugar', /\b(coke|pepsi|soda|juice|cola|sugarcane|rooh|aam panna)\b/],
  ['dairy',       /\b(milk|lassi|buttermilk|yogurt|curd|smoothie|shake|badam milk|haldi)\b/],
  ['sweet',       /\b(cake|brownie|chocolate|ice cream|cookie|biscuit|donut|gulab|jalebi|barfi|laddu|halwa|kulfi|rasgulla|rasmalai|kheer|payasam|sweet)\b/],
  ['fried',       /\b(samosa|pakora|vada|kachori|chips|fries|fritter|bhajji|bonda|nuggets|fried)\b/],
  ['fruit',       /\b(apple|banana|mango|orange|grape|watermelon|papaya|pomegranate|guava|pineapple|pear|strawberry|kiwi|lychee|chiku|jackfruit|dates|fig|fruit)\b/],
  ['protein',     /\b(chicken|egg|fish|paneer|tofu|mutton|prawn|kebab|tikka|dal|rajma|chole|chana|sambar|lentil|bean|soya|keema|tandoori|omelette)\b/],
  ['grain',       /\b(rice|roti|naan|paratha|bread|pasta|noodle|maggi|biryani|pulao|dosa|idli|uttapam|poha|upma|oats|cornflakes|muesli|dalia|khichdi|appam|puri|bhatura|kulcha|puttu|pongal|thepla|dhokla|sandwich|pizza|burger|wrap|roll)\b/],
  ['veg',         /\b(sabzi|salad|aloo|gobi|bhindi|baingan|palak|mushroom|matar|tinda|lauki|saag|veg|vegetable|avial|thoran|kootu|olan|bharta)\b/],
];

function classify(name: string): Category {
  const n = name.toLowerCase();
  for (const [cat, re] of KEYWORDS) {
    if (re.test(n)) return cat;
  }
  return 'mixed';
}

export function estimateMacros(name: string, calories: number): Macros {
  if (!calories || calories <= 0) {
    return { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  }
  const cat = classify(name);
  const prof = PROFILE[cat];
  const per100 = calories / 100;
  return {
    protein: round1((calories * prof.p) / 4),  // 4 kcal/g
    carbs:   round1((calories * prof.c) / 4),
    fat:     round1((calories * prof.f) / 9),  // 9 kcal/g
    fiber:   round1(prof.fiber * per100),
    sugar:   round1(prof.sugar * per100),
    sodium:  Math.round(prof.sodium * per100),
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce<Macros>(
    (acc, m) => ({
      protein: round1(acc.protein + m.protein),
      carbs:   round1(acc.carbs + m.carbs),
      fat:     round1(acc.fat + m.fat),
      fiber:   round1(acc.fiber + m.fiber),
      sugar:   round1(acc.sugar + m.sugar),
      sodium:  acc.sodium + m.sodium,
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

export const ZERO_MACROS: Macros = { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
