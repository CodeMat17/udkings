"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="shell flex min-h-[70svh] max-w-[68ch] flex-col justify-center py-16">
      <p className="label text-accent-ink">Something broke</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        We could not load that
      </h1>
      <p className="mt-4 text-muted-foreground">
        Your cart is safe — it lives in this browser. Try again, and if it keeps
        happening, message us on WhatsApp and we will take the order by hand.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-12 w-fit items-center rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
