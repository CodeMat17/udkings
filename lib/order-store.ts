import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Order } from "./types";

/**
 * The durable record. WhatsApp is the conversation; this is the record.
 *
 * Previously a JSON file behind a promise lock. The lock existed because a file
 * has no transactions, and it only ever held within one process — two instances
 * would have issued the same order number to two customers. Convex mutations
 * are serializable transactions, so the daily counter in `convex/orders.ts`
 * is atomic across every instance, and the lock is gone rather than moved.
 *
 * Order numbering and pricing now happen in the same transaction as the insert,
 * which is why creation is one call instead of `nextOrderNumber` + `persistOrder`.
 */

export type CreateOrderInput = {
  fulfilment: "pickup" | "delivery";
  customer: { name: string; phone: string; whatsapp: string };
  pickup?: { preferredDate: string; preferredTime: string };
  delivery?: {
    state: string;
    city: string;
    address: string;
    landmark: string;
    preferredDate: string;
    preferredTime: string;
    instructions: string;
  };
  deliveryFee: number | null;
  lines: { productId: string; quantity: number }[];
};

export async function createOrderRecord(
  input: CreateOrderInput,
): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  const result = await fetchMutation(api.orders.create, input);
  return result as { ok: true; order: Order } | { ok: false; error: string };
}

export async function findOrder(orderNumber: string): Promise<Order | null> {
  const order = await fetchQuery(api.orders.byNumber, { orderNumber });
  return (order as Order | null) ?? null;
}

export async function markWhatsappOpened(orderNumber: string): Promise<void> {
  await fetchMutation(api.orders.markWhatsappOpened, { orderNumber });
}
