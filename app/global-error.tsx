"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          background: "#F1F0EC",
          color: "#14162E",
        }}
      >
        <main style={{ maxWidth: "40ch", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>
            The site could not start
          </h1>
          <p style={{ marginTop: "12px" }}>
            Reload the page, or call the shop on 0806 656 8595.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              minHeight: "48px",
              padding: "0 24px",
              borderRadius: "14px",
              border: 0,
              background: "#C2185B",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
