import { lookupFood } from '@/data/foodDatabase';

export interface ParsedFoodItem {
  name: string;
  displayName: string;
  qty: number;
  cal: number;
  unit: string;
  found: boolean;
}

const STOP_WORDS = new Set([
  'i', 'ate', 'had', 'have', 'eaten', 'drink', 'drank',
  'some', 'a', 'an', 'the', 'with', 'of', 'for',
  'my', 'me', 'today', 'just', 'now', 'also', 'then',
  'morning', 'lunch', 'dinner', 'breakfast', 'snack',
  'in', 'at', 'to', 'was', 'were', 'been', 'got',
]);

// Number words
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, quarter: 0.25,
};

export function parseCalorieInput(input: string): ParsedFoodItem[] {
  const text = input.toLowerCase().trim();
  if (!text) return [];

  // Split by "and", commas, "&", "+"
  const segments = text.split(/\s*(?:,|\band\b|&|\+)\s*/);
  const results: ParsedFoodItem[] = [];

  for (const segment of segments) {
    const items = parseSegment(segment.trim());
    results.push(...items);
  }

  return results;
}

function parseSegment(segment: string): ParsedFoodItem[] {
  if (!segment) return [];

  const words = segment.split(/\s+/);
  let qty = 1;
  let qtyFound = false;
  const foodWords: string[] = [];

  for (const word of words) {
    // Check if it's a number
    const num = parseFloat(word);
    if (!isNaN(num) && !qtyFound) {
      qty = num;
      qtyFound = true;
      continue;
    }
    // Check number words
    if (NUMBER_WORDS[word] !== undefined && !qtyFound) {
      qty = NUMBER_WORDS[word];
      qtyFound = true;
      continue;
    }
    // Skip stop words
    if (STOP_WORDS.has(word)) continue;
    foodWords.push(word);
  }

  if (foodWords.length === 0) return [];

  // Try matching longest phrase first, then shorter
  const fullPhrase = foodWords.join(' ');
  const food = lookupFood(fullPhrase);

  if (food) {
    return [{
      name: food.name,
      displayName: food.displayName,
      qty,
      cal: Math.round(qty * food.caloriesPerUnit),
      unit: food.unit,
      found: true,
    }];
  }

  // Try individual words if multi-word didn't match
  if (foodWords.length > 1) {
    const results: ParsedFoodItem[] = [];
    // Try two-word combos first
    for (let i = 0; i < foodWords.length - 1; i++) {
      const twoWord = foodWords[i] + ' ' + foodWords[i + 1];
      const f = lookupFood(twoWord);
      if (f) {
        results.push({
          name: f.name,
          displayName: f.displayName,
          qty: i === 0 ? qty : 1,
          cal: Math.round((i === 0 ? qty : 1) * f.caloriesPerUnit),
          unit: f.unit,
          found: true,
        });
        // Skip next word
        foodWords.splice(i, 2);
        i--;
      }
    }
    // Try remaining individual words
    for (let i = 0; i < foodWords.length; i++) {
      const f = lookupFood(foodWords[i]);
      if (f) {
        results.push({
          name: f.name,
          displayName: f.displayName,
          qty: i === 0 && results.length === 0 ? qty : 1,
          cal: Math.round((i === 0 && results.length === 0 ? qty : 1) * f.caloriesPerUnit),
          unit: f.unit,
          found: true,
        });
      } else if (foodWords[i].length > 1) {
        results.push({
          name: foodWords[i],
          displayName: foodWords[i].charAt(0).toUpperCase() + foodWords[i].slice(1),
          qty: i === 0 && results.length === 0 ? qty : 1,
          cal: 0,
          unit: 'serving',
          found: false,
        });
      }
    }
    return results;
  }

  // Single word not found
  return [{
    name: fullPhrase,
    displayName: fullPhrase.charAt(0).toUpperCase() + fullPhrase.slice(1),
    qty,
    cal: 0,
    unit: 'serving',
    found: false,
  }];
}
