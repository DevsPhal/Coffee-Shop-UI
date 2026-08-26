/**
 * Formats and cleans phone number input values.
 * Automatically strips leading zeros ('0') and country code prefixes ('855' / '+855')
 * so that inputs with +855 prefix (like in Cambodia) always trim the leading zero.
 * 
 * Example:
 * - "0123222222" -> "123222222"
 * - "095600676"  -> "95600676"
 * - "+855012345" -> "12345"
 * - "0"          -> ""
 */
export function cleanPhoneInput(val: string): string {
  if (!val) return "";
  let digits = val.replace(/\D/g, "");
  if (digits.startsWith("855") && digits.length > 8) {
    digits = digits.slice(3);
  }
  return digits.replace(/^0+/, "");
}
