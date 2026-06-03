import { lookupFood } from '@/data/foodDatabase';
import { estimateMacros, Macros, ZERO_MACROS } from './macroEstimator';

export interface ParsedFoodItem {
  name: string;
  displayName: string;
  qty: number;
  cal: number;
  unit: string;
  found: boolean;
  macros?: Macros;
}

// Wrap the original parser to attach macros to every found item.
// (We patch at the end of this module via a re-export wrapper.)

const STOP_WORDS = new Set([
  'i', 'ate', 'had', 'have', 'eaten', 'drink', 'drank',
  'some', 'a', 'an', 'the', 'with', 'of', 'for',
  'my', 'me', 'today', 'just', 'now', 'also', 'then',
  'morning', 'lunch', 'dinner', 'breakfast', 'snack',
  'in', 'at', 'to', 'was', 'were', 'been', 'got',
  'plate', 'bowl', 'glass', 'cup', 'piece', 'pieces',
  'serving', 'servings',
]);

// Weight regex: matches "300g", "150gm", "200gms", "100 grams"
const WEIGHT_REGEX = /^(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)$/i;

// Number words
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12,
  half: 0.5, quarter: 0.25,
  'a': 1,
};

// Fraction regex: matches "1/2", "1/4", "3/4" etc.
const FRACTION_REGEX = /^(\d+)\/(\d+)$/;

// Mixed number: "1 1/2" handled by consecutive tokens
function parseQuantity(word: string): number | null {
  // Direct number
  const num = parseFloat(word);
  if (!isNaN(num)) return num;
  
  // Fraction like "1/2"
  const fracMatch = word.match(FRACTION_REGEX);
  if (fracMatch) {
    const numerator = parseInt(fracMatch[1]);
    const denominator = parseInt(fracMatch[2]);
    if (denominator !== 0) return numerator / denominator;
  }
  
  // Number words
  if (NUMBER_WORDS[word] !== undefined) return NUMBER_WORDS[word];
  
  return null;
}

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
  let weightGrams: number | null = null;
  const foodWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check for weight like "300g", "150gm"
    const weightMatch = word.match(WEIGHT_REGEX);
    if (weightMatch) {
      weightGrams = parseFloat(weightMatch[1]);
      qtyFound = true;
      continue;
    }
    
    // Check "300 g" or "300 grams" (number followed by unit)
    if (i + 1 < words.length && !isNaN(parseFloat(word))) {
      const nextWord = words[i + 1].toLowerCase();
      if (['g', 'gm', 'gms', 'gram', 'grams'].includes(nextWord)) {
        weightGrams = parseFloat(word);
        qtyFound = true;
        i++; // skip unit word
        continue;
      }
    }

    if (!qtyFound) {
      const q = parseQuantity(word);
      if (q !== null && word !== 'a') {
        if (i + 1 < words.length) {
          const nextQ = parseQuantity(words[i + 1]);
          const nextFrac = words[i + 1].match(FRACTION_REGEX);
          if (nextFrac && nextQ !== null) {
            qty = q + nextQ;
            qtyFound = true;
            i++;
            continue;
          }
        }
        qty = q;
        qtyFound = true;
        continue;
      }
      if (word === 'half' || word === 'quarter') {
        qty = NUMBER_WORDS[word];
        qtyFound = true;
        continue;
      }
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
    let cal: number;
    if (weightGrams !== null) {
      // Weight-based: use caloriesPerUnit as per-serving, estimate per 100g
      cal = Math.round((weightGrams / 100) * food.caloriesPerUnit);
    } else {
      cal = Math.round(qty * food.caloriesPerUnit);
    }
    return [{
      name: food.name,
      displayName: food.displayName,
      qty: weightGrams !== null ? weightGrams : qty,
      cal,
      unit: weightGrams !== null ? 'g' : food.unit,
      found: true,
    }];
  }

  // Try individual words if multi-word didn't match
  if (foodWords.length > 1) {
    const results: ParsedFoodItem[] = [];
    const used = new Set<number>();
    
    // Try three-word combos
    for (let i = 0; i < foodWords.length - 2; i++) {
      if (used.has(i) || used.has(i+1) || used.has(i+2)) continue;
      const threeWord = foodWords[i] + ' ' + foodWords[i+1] + ' ' + foodWords[i+2];
      const f = lookupFood(threeWord);
      if (f) {
        results.push({
          name: f.name, displayName: f.displayName,
          qty: results.length === 0 ? qty : 1,
          cal: Math.round((results.length === 0 ? qty : 1) * f.caloriesPerUnit),
          unit: f.unit, found: true,
        });
        used.add(i); used.add(i+1); used.add(i+2);
      }
    }
    
    // Try two-word combos
    for (let i = 0; i < foodWords.length - 1; i++) {
      if (used.has(i) || used.has(i+1)) continue;
      const twoWord = foodWords[i] + ' ' + foodWords[i + 1];
      const f = lookupFood(twoWord);
      if (f) {
        results.push({
          name: f.name, displayName: f.displayName,
          qty: results.length === 0 ? qty : 1,
          cal: Math.round((results.length === 0 ? qty : 1) * f.caloriesPerUnit),
          unit: f.unit, found: true,
        });
        used.add(i); used.add(i+1);
      }
    }
    
    // Try remaining individual words
    for (let i = 0; i < foodWords.length; i++) {
      if (used.has(i)) continue;
      const f = lookupFood(foodWords[i]);
      if (f) {
        results.push({
          name: f.name, displayName: f.displayName,
          qty: results.length === 0 ? qty : 1,
          cal: Math.round((results.length === 0 ? qty : 1) * f.caloriesPerUnit),
          unit: f.unit, found: true,
        });
      } else if (foodWords[i].length > 1) {
        results.push({
          name: foodWords[i],
          displayName: foodWords[i].charAt(0).toUpperCase() + foodWords[i].slice(1),
          qty: results.length === 0 ? qty : 1,
          cal: 0, unit: 'serving', found: false,
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
    cal: 0, unit: 'serving', found: false,
  }];
}
