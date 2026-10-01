import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}
