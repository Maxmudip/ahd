"use client";

/** Last-resort boundary for errors in the root layout itself. Must render its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="uz">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, display: "grid", minHeight: "100vh", placeItems: "center", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Xatolik yuz berdi</h1>
          <p style={{ color: "#787774", fontSize: 14 }}>
            Sahifani yuklab bo&apos;lmadi.{error.digest ? ` Kod: ${error.digest}` : ""}
          </p>
          <button type="button" onClick={reset} style={{ marginTop: 12, padding: "8px 16px", background: "#111", color: "#fff", border: 0, borderRadius: 6 }}>
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
