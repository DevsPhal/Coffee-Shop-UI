import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Capitalizes each word for display — product/category names come back from the API in
 * whatever case staff typed them in the admin ("cambodia (can)", "hot green tea"), which reads
 * as unfinished rather than a real menu. Small words in the middle of a title (of, and, the...)
 * stay lowercase, matching normal title-case convention; parentheses and hyphens are treated as
 * word boundaries so "(can)" becomes "(Can)", not "(can)".
 */
const TITLE_CASE_MINOR_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with",
]);

export function toTitleCase(text: string): string {
  if (!text) return text;
  let wordIndex = 0;
  return text.replace(/[A-Za-z0-9]+(?:['’][A-Za-z]+)*/g, (word) => {
    const isMinor = wordIndex > 0 && TITLE_CASE_MINOR_WORDS.has(word.toLowerCase());
    wordIndex += 1;
    return isMinor ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Capitalizes just the first letter — for staff-entered prose (an event/banner description)
 * where `toTitleCase` would be wrong (it would capitalize every word of a full sentence). Only
 * the first letter needed fixing to stop a lowercase-typed description ("testings") from
 * reading as unfinished; the rest of the sentence is left exactly as staff wrote it.
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}
