/**
 * Permissive on spacing and on the +234 / 0 prefixes — a customer typing
 * "+234 806 656 8595" and one typing "08066568595" are the same customer.
 */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("234") ? `0${digits.slice(3)}` : digits;
  if (!/^0[789][01]\d{8}$/.test(local)) return null;
  return local;
}

export function isValidPhone(input: string): boolean {
  return normalisePhone(input) !== null;
}

export const PHONE_ERROR =
  "Enter a phone number we can reach you on, like 0806 656 8595.";
