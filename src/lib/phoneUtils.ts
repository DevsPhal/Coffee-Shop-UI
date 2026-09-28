/**
 * One phone format for every field and display in the shop: "012 345 6789".
 *
 * The API validates against `^0\d{2}\s?\d{3}\s?\d{3,4}$` (ValidationPatterns.CAMBODIA_PHONE_REGEX),
 * so a Cambodian number must KEEP its leading zero and is 9-10 digits long. Inputs are grouped
 * 3-3-rest as the customer types, so the value is always already in the API's format.
 *
 * Examples:
 * - "0974445566"       -> "097 444 5566"
 * - "097 444 5566"     -> "097 444 5566"
 * - "+855 97 444 5566" -> "097 444 5566"
 * - "012345678"        -> "012 345 678"
 * - "0"                -> "0"             (still typeable)
 */

/** Cambodian numbers are at most 10 digits including the leading zero. */
export const PHONE_MAX_DIGITS = 10;
/** 10 digits plus the two grouping spaces. */
export const PHONE_MAX_LENGTH = PHONE_MAX_DIGITS + 2;
export const PHONE_PLACEHOLDER = "012 345 6789";
export const PHONE_PATTERN = /^0\d{2}\s?\d{3}\s?\d{3,4}$/;

/** Shared attributes for every phone `<input>` so they all behave the same on mobile and desktop. */
export const phoneInputProps = {
  type: "tel",
  inputMode: "numeric",
  autoComplete: "tel-national",
  maxLength: PHONE_MAX_LENGTH,
  placeholder: PHONE_PLACEHOLDER,
} as const;

/** Digits only, "+855…" turned into the national leading zero, capped at 10 digits. */
export function phoneDigits(val: string | null | undefined): string {
  let digits = (val ?? "").replace(/\D/g, "");
  // "+855 97…" / "855 97…" -> national "097…". Guarded on length so a number that merely
  // starts with 855 mid-typing is not mangled.
  if (digits.startsWith("855") && digits.length > 8) {
    const national = digits.slice(3);
    digits = national.startsWith("0") ? national : `0${national}`;
  }
  return digits.slice(0, PHONE_MAX_DIGITS);
}

/** Groups digits as "012 345 6789" — used on every keystroke of a phone input. */
export function cleanPhoneInput(val: string): string {
  const digits = phoneDigits(val);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");
}

/** For displaying a stored number; leaves anything that isn't a national number untouched. */
export function formatPhone(val: string | null | undefined): string {
  if (!val) return "";
  const formatted = cleanPhoneInput(val);
  return PHONE_PATTERN.test(formatted) ? formatted : val;
}

/** True when both values are the same number, however they are spaced. */
export function samePhone(a: string | null | undefined, b: string | null | undefined): boolean {
  return phoneDigits(a) === phoneDigits(b);
}
