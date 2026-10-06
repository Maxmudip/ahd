"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

export default function HomePage() {
  const [menu, setMenu] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#f0f0ee", color: "#0a0a0a", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", position: "sticky", top: 0, zIndex: 50, background: "#f0f0ee", borderBottom: "1px solid #e8e8e6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ width: 32, height: 32, background: "#0a0a0a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>A</span>
          </Link>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#xususiyatlar" style={{ fontSize: 14, color: "#555", textDecoration: "none" }}>Xususiyatlar</a>
            <a href="#narxlar" style={{ fontSize: 14, color: "#555", textDecoration: "none" }}>Narxlar</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/login" style={{ fontSize: 14, color: "#555", textDecoration: "none" }}>Kirish</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 600, background: "#0a0a0a", color: "#fff", borderRadius: 100, padding: "8px 20px", textDecoration: "none" }}>
            Boshlash
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "88vh", display: "flex", alignItems: "flex-end", padding: "0 32px 48px" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "52%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <PhoneIllustration />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 560 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.4 }}>
            Kelishuvni rasmiylashtiring.<br />AI yordamida, darhol.
          </p>
          <h1 style={{ fontSize: "clamp(52px, 8vw, 88px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em", margin: "0 0 32px" }}>
            Kelishing,<br />Imzolang
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/register" style={{ fontSize: 15, fontWeight: 600, background: "#0a0a0a", color: "#fff", borderRadius: 100, padding: "13px 28px", textDecoration: "none" }}>
              Bepul boshlash
            </Link>
            <a href="#xususiyatlar" style={{ fontSize: 15, fontWeight: 500, background: "transparent", color: "#0a0a0a", border: "1px solid #ccc", borderRadius: 100, padding: "13px 28px", textDecoration: "none" }}>
              Qanday ishlaydi
            </a>
          </div>
        </div>
      </section>

      {/* TAGLINE */}
      <section style={{ padding: "80px 32px", textAlign: "center", background: "#fff" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 680, margin: "0 auto 16px" }}>
          Chat orqali muzokara,{" "}
          <AvatarGroup />{" "}
          AI kelishuv tuzsin
        </h2>
        <p style={{ fontSize: 16, color: "#666", maxWidth: 480, margin: "0 auto" }}>
          Ikkala tomon chat qiladi. Shartlar belgilanadi. Hujjat avtomatik tayyorlanib, imzo kutadi.
        </p>
      </section>

      {/* FEATURES */}
      <section id="xususiyatlar" style={{ padding: "80px 32px", background: "#f0f0ee" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          <div>
            <LaptopMock />
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, background: "#0a0a0a", color: "#fff", borderRadius: 100, padding: "12px 20px", width: "fit-content" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Demo ko'rish</span>
              <span style={{ width: 28, height: 28, background: "#333", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>›</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 32 }}>Bir platformada hamma narsa — muzokara, kelishuv, imzo.</p>
            {[
              { n: "01", title: "AI Kelishuv", body: "Chat tarixidan avtomatik shartnoma. Siz so'zlang, AI yozsin." },
              { n: "02", title: "Pool Qarz", body: "Bir kishi so'raydi, do'stlar yig'adi. Har bir to'lov ochiq." },
              { n: "03", title: "Raqamli Imzo", body: "Yuridik kuchga ega. PDF yuklab oling, arxivda saqlang." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 24, padding: "24px 0", borderBottom: "1px solid #e8e8e6" }}>
                <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600, minWidth: 24, paddingTop: 3 }}>{item.n}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{item.body}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 32, background: "#0a0a0a", color: "#fff", borderRadius: 20, padding: "24px 28px" }}>
              <p style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em" }}>2 min</p>
              <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>O'rtacha kelishuv tuzish vaqti</p>
            </div>
          </div>
        </div>
      </section>

      {/* POOL QARZ */}
      <section id="pool-qarz" style={{ padding: "80px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #e8e8e6", borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, background: "#0a0a0a", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>YANGI</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 20 }}>
                Pool Qarz —<br />guruh kreditlash
              </h2>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
                Bir kishi so'raydi, do'stlar yig'adi. Kim qancha bergani, qancha qolgani va qaytarish muddati hammaga ochiq.
              </p>
              {["Bir nechta qarz beruvchi", "Avtomatik hisob-kitob", "Shaffof tarix"].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 20, height: 20, background: "#0a0a0a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 15 }}>{p}</span>
                </div>
              ))}
            </div>
            <PoolMock />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "64px 32px", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {[
            { v: "10K+", l: "Yaratilgan kelishuv" },
            { v: "98%", l: "Muvaffaqiyat darajasi" },
            { v: "2 min", l: "O'rtacha vaqt" },
            { v: "4.9★", l: "Foydalanuvchi bahosi" },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.v}</p>
              <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: "80px 32px", background: "#f0f0ee" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 40 }}>Foydalanuvchilar aytadi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { text: "Avval WhatsAppda kelishib, keyin Wordda yozardik. Ahd ikkalasini bir joyga qo'ydi.", name: "Jasur Karimov", role: "Freelance dizayner" },
              { text: "Pool Qarz oilaviy yig'imni tartibga soldi. Kim qancha bergani ochiq, bahs yo'q.", name: "Madina Yusupova", role: "Tadbirkor" },
              { text: "Mijozlarim endi og'zaki va'daga ishonmaydi. Chat + imzo — hammasi Ahd da qoladi.", name: "Sardor Aliyev", role: "Qurilish pudratchisi" },
            ].map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px" }}>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#222", marginBottom: 24 }}>"{r.text}"</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</p>
                <p style={{ fontSize: 13, color: "#888" }}>{r.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEZ ORADA */}
      <section style={{ padding: "80px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px dashed #ccc", borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, background: "#bbb", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>TEZ ORADA</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 32 }}>Yangi imkoniyatlar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { icon: "🎙️", title: "Ovozli kelishuvlar", body: "Gaplashing, AI yozib olsin. Og'zaki muzokaradan avtomatik hujjat." },
              { icon: "✈️", title: "Telegram Mini App", body: "To'g'ridan-to'g'ri Telegramda. Chiqmay turib kelishing imzolang." },
            ].map((c, i) => (
              <div key={i} style={{ border: "1.5px dashed #ddd", borderRadius: 20, padding: "28px 24px", background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <span style={{ fontSize: 12, color: "#aaa" }}>🔒 Tez orada</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{c.title}</p>
                <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NARXLAR */}
      <section id="narxlar" style={{ padding: "80px 32px", background: "#f0f0ee" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Narxlar</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 40 }}>Oddiy tariflar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { name: "Free", price: "0", period: "so'm", blurb: "Sinab ko'rish uchun", points: ["3 ta kelishuv / oy", "AI qoralama", "PDF yuklash"], featured: false },
              { name: "Pro", price: "49 000", period: "so'm/oy", blurb: "Cheksiz ish", points: ["Cheksiz kelishuv", "AI vositachi", "Raqamli imzo"], featured: true },
              { name: "Business", price: "149 000", period: "so'm/oy", blurb: "Jamoa uchun", points: ["Jamoa workspace", "Cheksiz a'zolar", "Admin boshqaruvi"], featured: false },
            ].map((plan, i) => (
              <div key={i} style={{ borderRadius: 20, padding: "28px 24px", background: plan.featured ? "#0a0a0a" : "#fff", color: plan.featured ? "#fff" : "#0a0a0a", border: plan.featured ? "none" : "1px solid #e8e8e6" }}>
                <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, marginBottom: 12 }}>{plan.name}</p>
                <p style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em" }}>
                  {plan.price}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.6, marginLeft: 4 }}>{plan.period}</span>
                </p>
                <p style={{ fontSize: 13, opacity: 0.6, margin: "8px 0 20px" }}>{plan.blurb}</p>
                {plan.points.map((p, j) => (
                  <p key={j} style={{ fontSize: 14, marginBottom: 8, opacity: 0.85 }}>✓ {p}</p>
                ))}
                <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 24, padding: "11px 0", borderRadius: 100, fontSize: 14, fontWeight: 600, textDecoration: "none", background: plan.featured ? "#fff" : "#0a0a0a", color: plan.featured ? "#0a0a0a" : "#fff" }}>
                  Boshlash
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 32px", background: "#0a0a0a", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>Bugun boshlang</h2>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 36 }}>Birinchi kelishuvingizni bepul tuzing.</p>
        <Link href="/register" style={{ fontSize: 15, fontWeight: 600, background: "#fff", color: "#0a0a0a", borderRadius: 100, padding: "14px 32px", textDecoration: "none" }}>
          Bepul ro'yxatdan o'tish
        </Link>
        <p style={{ fontSize: 13, color: "#555", marginTop: 16 }}>Kredit kartasi shart emas</p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "48px 32px", borderTop: "1px solid #1a1a1a", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Ahd</p>
            <p style={{ fontSize: 13, color: "#555" }}>So'zingiz hujjat bo'lsin.</p>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            {[
              { title: "Mahsulot", links: [{ l: "Xususiyatlar", h: "#xususiyatlar" }, { l: "Narxlar", h: "#narxlar" }, { l: "Pool Qarz", h: "#pool-qarz" }] },
              { title: "Kompaniya", links: [{ l: "Kirish", h: "/login" }, { l: "Ro'yxatdan o'tish", h: "/register" }, { l: "Aloqa", h: "mailto:info@useahd.com" }] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 14 }}>{col.title}</p>
                {col.links.map((link, j) => (
                  <a key={j} href={link.h} style={{ display: "block", fontSize: 14, color: "#666", textDecoration: "none", marginBottom: 10 }}>{link.l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "32px auto 0", borderTop: "1px solid #1a1a1a", paddingTop: 24 }}>
          <p style={{ fontSize: 13, color: "#444" }}>© 2024 Ahd. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function PhoneIllustration() {
  return (
    <div style={{ position: "relative", width: 320, height: 480 }}>
      <div style={{ position: "absolute", bottom: 0, right: 20, width: 200, height: 320, background: "linear-gradient(160deg, #d4d4d2 0%, #b8b8b5 100%)", borderRadius: "40% 30% 0 0 / 50% 40% 0 0", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 220, height: 180, background: "#0a0a0a", borderRadius: "30% 20% 0 0", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", top: 20, left: 20, width: 180, height: 320, background: "#fff", borderRadius: 28, border: "8px solid #111", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", overflow: "hidden", transform: "rotate(6deg)" }}>
        <div style={{ width: 60, height: 6, background: "#111", borderRadius: 4, margin: "10px auto" }} />
        <div style={{ padding: "8px 10px" }}>
          <p style={{ fontSize: 8, fontWeight: 700, color: "#333", marginBottom: 8 }}>Ahd · Chat</p>
          <div style={{ background: "#f5f5f5", borderRadius: 10, padding: "6px 8px", marginBottom: 6 }}>
            <p style={{ fontSize: 7, color: "#444" }}>Logo dizayn — 3 000 000 so'm</p>
          </div>
          <div style={{ background: "#0a0a0a", borderRadius: 10, padding: "6px 8px", marginLeft: "20%", marginBottom: 6 }}>
            <p style={{ fontSize: 7, color: "#fff" }}>Avans 40% qabul</p>
          </div>
          <div style={{ background: "#f0f0ee", borderRadius: 10, padding: "8px", border: "1px solid #ddd", marginTop: 10 }}>
            <p style={{ fontSize: 7, fontWeight: 700, color: "#333" }}>Kelishuv tayyor ✓</p>
            <p style={{ fontSize: 6, color: "#888", marginTop: 2 }}>AI qoralama · imzo kutilmoqda</p>
          </div>
        </div>
      </div>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 320 480">
        <path d="M 20 100 Q 200 50 300 200" stroke="#ccc" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 10 200 Q 150 100 280 300" stroke="#ddd" strokeWidth="1" fill="none" opacity="0.4" />
        <circle cx="290" cy="60" r="3" fill="#aaa" opacity="0.5" />
        <text x="260" y="50" fontSize="20" opacity="0.4">✈</text>
      </svg>
    </div>
  );
}

function AvatarGroup() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
      {["#d4a0b0", "#a0b4d4", "#a0d4b0"].map((c, i) => (
        <span key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: "2px solid #fff", marginLeft: i > 0 ? -10 : 0, display: "inline-block" }} />
      ))}
      <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#0a0a0a", border: "2px solid #fff", marginLeft: -10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700 }}>+</span>
    </span>
  );
}

function LaptopMock() {
  return (
    <div>
      <div style={{ background: "#0a0a0a", borderRadius: "16px 16px 0 0", padding: "12px 16px 8px", border: "8px solid #1a1a1a" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#333" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minHeight: 180 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ fontSize: 9, color: "#666", marginBottom: 8 }}>Chat</p>
            <div style={{ background: "#2a2a2a", borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
              <p style={{ fontSize: 8, color: "#ccc" }}>Muddat — 12-oktabr</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 8, padding: "6px 8px", marginLeft: "20%" }}>
              <p style={{ fontSize: 8, color: "#000" }}>Qabul. Imzolayman.</p>
            </div>
          </div>
          <div style={{ background: "#111", borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ fontSize: 9, color: "#666", marginBottom: 8 }}>Kelishuv</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>1. Tomonlar</p>
            <p style={{ fontSize: 8, color: "#666", marginTop: 4 }}>Tomon A: Muhammad</p>
            <p style={{ fontSize: 8, color: "#666" }}>Tomon B: Jasur</p>
            <div style={{ height: 1, background: "#2a2a2a", margin: "8px 0" }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>2. Shartlar</p>
            <p style={{ fontSize: 8, color: "#666", marginTop: 4 }}>3 000 000 so'm</p>
          </div>
        </div>
      </div>
      <div style={{ background: "#1a1a1a", height: 12, borderRadius: "0 0 4px 4px" }} />
      <div style={{ background: "#111", height: 6, borderRadius: "0 0 8px 8px", width: "80%", margin: "0 auto" }} />
    </div>
  );
}

function PoolMock() {
  return (
    <div style={{ background: "#f5f5f5", borderRadius: 24, padding: 24, border: "1px solid #e8e8e6" }}>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Pool Qarz</p>
      <p style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em" }}>12 000 000</p>
      <p style={{ fontSize: 12, color: "#aaa" }}>so'm · ta'lim uchun</p>
      <div style={{ height: 8, background: "#e0e0e0", borderRadius: 100, margin: "16px 0 8px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "67%", background: "#0a0a0a", borderRadius: 100 }} />
      </div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>8 000 000 / 12 000 000 · 67%</p>
      {[["MK", "Madina Karimova", "4 000 000"], ["SA", "Sardor Aliyev", "4 000 000"]].map(([ini, name, sum], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ width: 32, height: 32, background: "#0a0a0a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{ini}</span>
          <span style={{ flex: 1, fontSize: 14 }}>{name}</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{sum}</span>
        </div>
      ))}
    </div>
  );
}