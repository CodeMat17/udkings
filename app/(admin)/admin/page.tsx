import type { Metadata } from "next";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { listOrders, listProducts, signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The signed-in landing: what is in the shop, and what has been ordered.
 *
 * The pieces themselves are managed at `/admin/products`; this stays the
 * overview. Still to come in Phase 5: an orders board with status changes,
 * customers, delivery zones and settings.
 *
 * The path every one of them follows is proven here: session cookie → server
 * action → secret-guarded Convex query, with the browser never holding a secret.
 */
export default async function AdminPage() {
  const [products, orders] = await Promise.all([listProducts(), listOrders()]);
  const live = products.filter((p) => !p.isArchived);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="label text-accent-ink">UDKING&rsquo;S</p>
          <h1 className="display mt-1 text-3xl">Shop admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" render={<Link href="/admin/products" />}>
            Products
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Live pieces", value: String(live.length) },
          { label: "Archived", value: String(products.length - live.length) },
          { label: "Orders", value: String(orders.length) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border p-4">
            <dt className="label text-muted-foreground">{stat.label}</dt>
            <dd className="display mt-1 text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="display mt-12 text-xl">Latest orders</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No orders yet. They will appear here the moment one is placed.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="label py-2 pr-4">Order</th>
                <th scope="col" className="label py-2 pr-4">Customer</th>
                <th scope="col" className="label py-2 pr-4">Status</th>
                <th scope="col" className="label py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 20).map((order) => (
                <tr key={order.orderNumber} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium">{order.orderNumber}</td>
                  <td className="py-2 pr-4">{order.customer.name}</td>
                  <td className="py-2 pr-4">{order.status.replace(/_/g, " ")}</td>
                  <td className="py-2">{formatNaira(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
