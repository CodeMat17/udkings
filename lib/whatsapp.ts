import { BUSINESS } from "./business.ts";

/** WhatsApp truncates very long links. Stay well under it. */
const MAX_CHARS = 1600;

export type MessageLine = { name: string; size?: string; quantity: number };

/**
 * The whole "checkout". There is no payment and no order record: the bag
 * becomes one plain message, and the shop confirms availability and the total
 * price in the chat.
 */
export function composeBagMessage(lines: MessageLine[]): string {
  const head = [`Hello ${BUSINESS.name}, I'd like to order:`, ""];
  const tail = ["", "Please confirm availability and total price."];
  const items = lines.map(
    (line) => `${line.name}${line.size ? ` (Size ${line.size})` : ""} — Qty ${line.quantity}`,
  );

  const full = [...head, ...items, ...tail].join("\n");
  if (full.length <= MAX_CHARS) return full;

  const kept = items.slice(0, 15);
  const remaining = items.length - kept.length;
  return [
    ...head,
    ...kept,
    `…and ${remaining} more ${remaining === 1 ? "item" : "items"}`,
    ...tail,
  ].join("\n");
}

/** A question about one piece, arriving with the piece already identified. */
export function composeProductEnquiry(input: { name: string; url: string; size?: string }): string {
  return [
    `Hello ${BUSINESS.name}, I have a question about this piece.`,
    "",
    `Item: ${input.name}${input.size ? ` (Size ${input.size})` : ""}`,
    `Link: ${input.url}`,
    "",
    "My question: ",
  ].join("\n");
}

export function composeSavedMessage(names: string[]): string {
  return [
    `Hello ${BUSINESS.name}, please let me know if these are still available:`,
    "",
    ...names,
  ].join("\n");
}
