import assert from "node:assert/strict";
import { test } from "node:test";
import { composeBagMessage, composeProductEnquiry } from "./whatsapp.ts";

test("the bag becomes the order message the shop asked for", () => {
  const message = composeBagMessage([
    { name: "Satin Cowl Neck Maxi Gown", quantity: 2 },
    { name: "Raw Indigo Straight Jeans", size: "30", quantity: 1 },
  ]);
  assert.equal(
    message,
    [
      "Hello UDKING'S Collections, I'd like to order:",
      "",
      "Satin Cowl Neck Maxi Gown — Qty 2",
      "Raw Indigo Straight Jeans (Size 30) — Qty 1",
      "",
      "Please confirm availability and total price.",
    ].join("\n"),
  );
  assert.ok(!message.includes("*"), "plain text, never markdown");
});

test("a very long bag is truncated but keeps the request", () => {
  const lines = Array.from({ length: 80 }, (_, i) => ({
    name: `A Rather Long Product Name Number ${i}`,
    size: "XL",
    quantity: 3,
  }));
  const message = composeBagMessage(lines);
  assert.ok(message.length < 1900, "the link must stay under WhatsApp's limit");
  assert.match(message, /…and 65 more items/);
  assert.match(message, /Please confirm availability and total price\.$/);
});

test("a product enquiry names the piece and the size", () => {
  const message = composeProductEnquiry({
    name: "Denim Pencil Midi Skirt",
    url: "https://udkings.com/product/denim-pencil-midi-skirt",
    size: "M",
  });
  assert.match(message, /Item: Denim Pencil Midi Skirt \(Size M\)/);
  assert.match(message, /Link: https:\/\/udkings\.com\/product\/denim-pencil-midi-skirt/);
});
