/**
 * Normalises phone input to the national format the API accepts.
 *
 * The API validates against `^0\d{2}\s?\d{3}\s?\d{3,4}$` (ValidationPatterns.CAMBODIA_PHONE_REGEX),
 * so a Cambodian number must KEEP its leading zero — "097 444 5566", not "97 444 5566".
 *
 * This helper used to strip leading zeros, for a UI that showed a separate "+855" prefix. That
 * made the leading zero untypeable: every keystroke removed it, so no entry could ever satisfy
 * the API and phone-bearing forms (sign-up, checkout, profile) could not be submitted.
 *
 * It now converts a country-code prefix into the leading zero instead of deleting it.
 *
 * Examples:
 * - "097 444 5566"   -> "097 444 5566"   (kept as typed)
 * - "0974445566"     -> "0974445566"
 * - "+855 97 444 5566" -> "097 444 5566"
 * - "85597 444 5566" -> "097 444 5566"
 * - "0"              -> "0"              (still typeable)
 */
export function cleanPhoneInput(val: string): string {
  if (!val) return "";

  // Keep digits and single spaces; the API's regex allows the spaces people naturally type.
  let cleaned = val.replace(/[^\d\s]/g, "").replace(/\s{2,}/g, " ");

  const digitsOnly = cleaned.replace(/\s/g, "");

  // "+855 97…" / "855 97…" -> national "097…". Guarded on length so a number that merely
  // starts with 855 (unlikely, but possible mid-typing) is not mangled.
  if (digitsOnly.startsWith("855") && digitsOnly.length > 8) {
    const national = digitsOnly.slice(3);
    cleaned = national.startsWith("0") ? national : `0${national}`;
  }

  // Cambodian numbers are 9-10 digits including the leading zero; stop runaway paste.
  const trimmed = cleaned.replace(/\s/g, "");
  if (trimmed.length > 10) {
    cleaned = trimmed.slice(0, 10);
  }

  return cleaned;
}
