import assert from "node:assert/strict";
import { test } from "node:test";
import { composeOrderMessage } from "./whatsapp.ts";
import type { Order, OrderItem } from "./types.ts";

/**
 * These were part of `order-store.test.ts` until the store moved to Convex.
 * Message composition is pure, so it still tests here without a deployment.
 * The guarantees that used to be tested against the file store — unique order
 * numbers under concurrent submission — are now the database's, enforced by
 * Convex's serializable mutations rather than by a lock we wrote.
 */

function item(index: number): OrderItem {
  return {
    productId: `prd_${String(index + 1).padStart(3, "0")}`,
    productName: `Test Piece ${index}`,
    slug: `test-piece-${index}`,
    image: `/catalogue/test-piece-${index}.jpg`,
    colors: ["Black", "Bone"],
    sizes: ["S", "M", "L"],
    color: "Black",
    size: "M",
    quantity: 2,
    unitPrice: 8500,
    appliedTier: "retail",
    lineTotal: 17000,
  };
}

function sampleOrder(orderNumber: string, itemCount: number): Order {
  const items = Array.from({ length: itemCount }, (_, i) => item(i));
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  return {
    orderNumber,
    status: "received",
    fulfilment: "delivery",
    customer: { name: "Jane Doe", phone: "0806 656 8595", whatsapp: "0806 656 8595" },
    delivery: {
      state: "Lagos",
      city: "Ikoyi",
      address: "12 Awolowo Road, Ikoyi",
      landmark: "Beside Zenith Bank",
      preferredDate: "2026-08-20",
      preferredTime: "Morning",
      instructions: "",
    },
    items,
    subtotal,
    deliveryFee: null,
    total: subtotal,
    whatsappOpened: false,
    createdAt: Date.UTC(2026, 7, 18),
  };
}

test("the WhatsApp message asks the shop for the delivery fee", () => {
  const message = composeOrderMessage(sampleOrder("UDK-20260818-901", 1));
  assert.match(message, /Order No: UDK-20260818-901/);
  assert.match(message, /Delivery: Please confirm the fee/);
  assert.match(
    message,
    /Total for the goods: /,
    "the total is the goods — only the shop sets the delivery fee",
  );
  assert.match(message, /Landmark: Beside Zenith Bank/);
  assert.match(message, /Colour: Black/, "the message states the colour chosen");
  assert.match(message, /Size: M/);
  assert.match(
    message,
    /Please confirm the colours and sizes above/,
    "every line was chosen, so the shop confirms rather than asks",
  );
  assert.ok(!message.includes("*"), "the message is plain text, never markdown");
});

test("a line with no choice falls back to stating what we have", () => {
  const order = sampleOrder("UDK-20260818-903", 1);
  order.items[0] = { ...order.items[0]!, color: undefined, size: undefined };
  const message = composeOrderMessage(order);
  assert.match(message, /Colour: any of Black, Bone/);
  assert.match(message, /Size: any of S, M, L/);
  assert.match(
    message,
    /tell us the colour and the size you want/,
    "an unchosen line still gets settled in the conversation",
  );
});

test("a very long order is truncated but still points at the record", () => {
  const message = composeOrderMessage(sampleOrder("UDK-20260818-902", 40));
  assert.ok(message.length < 1900, "the link must stay well under WhatsApp's limit");
  assert.match(message, /…and 30 more items — see order UDK-20260818-902/);
  assert.match(message, /Total for the goods: /, "the totals still survive truncation");
});

test("a pickup order says so and never quotes a delivery fee", () => {
  const order = sampleOrder("UDK-20260818-903", 1);
  const pickup: Order = {
    ...order,
    fulfilment: "pickup",
    delivery: undefined,
    pickup: { preferredDate: "2026-08-20", preferredTime: "Afternoon" },
    deliveryFee: 0,
  };
  const message = composeOrderMessage(pickup);
  assert.match(message, /Order type: Pickup/);
  assert.match(message, /Delivery: Pickup at the shop/);
  assert.ok(!message.includes("Address:"), "a pickup order has no delivery address");
});
