import { BUSINESS } from "./business.ts";
import { formatDate, formatNaira } from "./format.ts";
import type { Order } from "./types";

/** WhatsApp truncates very long links. Stay well under it. */
const MAX_CHARS = 1600;

export function composeOrderMessage(order: Order): string {
  const lines: string[] = [];
  lines.push(`Hello ${BUSINESS.name}, I would like to place an order.`);
  lines.push("");
  lines.push(`Order No: ${order.orderNumber}`);
  lines.push(`Name: ${order.customer.name}`);
  lines.push(`Phone: ${order.customer.phone}`);
  lines.push("");
  lines.push("ITEMS");

  const itemLines = order.items.map((item, i) => {
    const tier = item.appliedTier === "wholesale" ? " (wholesale)" : "";
    return [
      `${i + 1}. ${item.productName} — ${item.quantity} pcs @ ${formatNaira(item.unitPrice)}${tier} = ${formatNaira(item.lineTotal)}`,
      // The chosen one when there is one; the availability otherwise, for a
      // line that pre-dates choosing.
      `   Colour: ${item.color ?? `any of ${item.colors.join(", ")}`}`,
      `   Size: ${item.size ?? `any of ${item.sizes.join(", ")}`}`,
    ].join("\n");
  });

  const tail: string[] = [];
  tail.push("");
  // The colour and size chosen on the product page ride along on every line
  // above; the reply is where the shop confirms them.
  tail.push(
    order.items.every((item) => item.color && item.size)
      ? "Please confirm the colours and sizes above."
      : "Please tell us the colour and the size you want for each piece and we will confirm.",
  );
  tail.push("");
  tail.push(`Order type: ${order.fulfilment === "pickup" ? "Pickup" : "Delivery"}`);
  if (order.fulfilment === "delivery" && order.delivery) {
    // The address is typed as one line now, and the city and state come from
    // the zone — so drop whichever of them is empty rather than printing gaps.
    tail.push(
      `Address: ${[order.delivery.address, order.delivery.city, order.delivery.state]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(", ")}`,
    );
    if (order.delivery.landmark) tail.push(`Landmark: ${order.delivery.landmark}`);
    if (order.delivery.preferredDate) tail.push(`Preferred date: ${formatDate(order.delivery.preferredDate)}`);
    if (order.delivery.preferredTime) tail.push(`Preferred time: ${order.delivery.preferredTime}`);
    if (order.delivery.instructions) tail.push(`Instructions: ${order.delivery.instructions}`);
  }
  if (order.fulfilment === "pickup" && order.pickup) {
    tail.push(`Pickup at: ${BUSINESS.address.street}, ${BUSINESS.address.locality}`);
    if (order.pickup.preferredDate) tail.push(`Preferred date: ${formatDate(order.pickup.preferredDate)}`);
    if (order.pickup.preferredTime) tail.push(`Preferred time: ${order.pickup.preferredTime}`);
  }
  tail.push("");
  tail.push(`Subtotal: ${formatNaira(order.subtotal)}`);
  tail.push(
    `Delivery: ${
      order.fulfilment === "pickup"
        ? "Pickup at the shop"
        : order.deliveryFee === null
          ? "Please confirm the fee"
          : formatNaira(order.deliveryFee)
    }`,
  );
  // The total is the goods. Delivery is the shop's to set, so the message asks
  // for it rather than pretending the website already knew it.
  tail.push(
    `Total${order.fulfilment === "delivery" && order.deliveryFee === null ? " for the goods" : ""}: ${formatNaira(order.total)}`,
  );

  const full = [...lines, ...itemLines, ...tail].join("\n");
  if (full.length <= MAX_CHARS) return full;

  // Too long: send the first ten items and lean on the order record.
  const kept = itemLines.slice(0, 10);
  const remaining = itemLines.length - kept.length;
  return [
    ...lines,
    ...kept,
    `…and ${remaining} more ${remaining === 1 ? "item" : "items"} — see order ${order.orderNumber}`,
    ...tail,
  ].join("\n");
}

/**
 * Everything a customer might still want to ask about one piece — colour,
 * size, availability, price at quantity — goes to WhatsApp with the product
 * already identified, so nobody has to describe it twice.
 */
export function composeProductEnquiry(input: {
  name: string;
  sku: string;
  url: string;
  colors?: string[];
  sizes?: string[];
  /** What the customer picked on the page, when they picked. */
  color?: string;
  size?: string;
  quantity?: number;
  question?: string;
}): string {
  const lines = [
    `Hello ${BUSINESS.name}, I have a question about this piece.`,
    "",
    `Item: ${input.name}`,
    `SKU: ${input.sku}`,
  ];
  if (input.color) lines.push(`Colour I want: ${input.color}`);
  else if (input.colors?.length) lines.push(`Colours listed: ${input.colors.join(", ")}`);
  if (input.size) lines.push(`Size I want: ${input.size}`);
  else if (input.sizes?.length) lines.push(`Sizes listed: ${input.sizes.join(", ")}`);
  if (input.quantity && input.quantity > 1) lines.push(`Quantity: ${input.quantity} pieces`);
  lines.push(`Link: ${input.url}`);
  lines.push("");
  lines.push(input.question?.trim() || "My question: ");
  return lines.join("\n");
}

export function composeWishlistMessage(names: string[]): string {
  return [
    `Hello ${BUSINESS.name}, please let me know if these are still available:`,
    "",
    ...names.map((n, i) => `${i + 1}. ${n}`),
  ].join("\n");
}

export function composeEnquiryMessage(input: {
  name: string;
  phone: string;
  business: string;
  interest: string;
  quantity: string;
}): string {
  return [
    `Hello ${BUSINESS.name}, I would like your wholesale catalogue.`,
    "",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Business: ${input.business || "—"}`,
    `Interested in: ${input.interest}`,
    `Estimated quantity: ${input.quantity}`,
  ].join("\n");
}
