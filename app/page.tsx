"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { href: "#xususiyatlar", label: "Xususiyatlar" },
  { href: "#pool-qarz", label: "Pool Qarz" },
  { href: "#narxlar", label: "Narxlar" },
];

const FEATURES = [
  { icon: "📄", title: "AI Kelishuv", body: "Chat tarixidan avtomatik shartnoma yaratadi" },
  { icon: "💰", title: "Pool Qarz", body: "Guruh qarz — hamma qatnashadi, hamma ko'radi" },
  { icon: "✍️", title: "Raqamli Imzo", body: "Yuridik kuchga ega elektron imzo" },
  { icon: "💬", title: "Real-vaqt Chat", body: "WhatsApp kabi muzokaralar" },
  { icon: "🤖", title: "AI Vositachi", body: "Kelishuv jarayonida aqlli maslahatlar" },
  { icon: "⭐", title: "Reyting tizimi", body: "Ishonchli hamkorlarni toping" },
];

const STEPS = [
  { n: "01", title: "Taklif yuboring", body: "Email orqali sherikingizni chaqiring. U qabul qilgach chat ochiladi." },
  { n: "02", title: "Muzokara qiling", body: "Shartlarni oddiy tilda yozing. AI muhokamani kuzatib turadi." },
  { n: "03", title: "Imzolang", body: "Hujjat tayyor. Har ikki tomon raqamli imzo qo'yadi — ish yakun." },
];

const POOL_POINTS = [
  "Bir nechta qarz beruvchi",
  "Avtomatik hisob-kitob",
  "Shaffof tarix",
];

const STATS = [
  { value: "10K+", label: "Yaratilgan kelishuv" },
  { value: "98%", label: "Muvaffaqiyat darajasi" },
  { value: "2 min", label: "O'rtacha tuzish vaqti" },
  { value: "4.9★", label: "Foydalanuvchi bahosi" },
];

const PLANS = [
  { name: "Free", price: "0", period: "so'm", blurb: "Sinab ko'rish uchun", points: ["3 ta kelishuv / oy", "AI qoralama", "PDF yuklash"] },
  { name: "Pro", price: "49 000", period: "so'm/oy", blurb: "Cheksiz ish", points: ["Cheksiz kelishuv", "AI vositachi", "Raqamli imzo"], featured: true },
  { name: "Business", price: "149 000", period: "so'm/oy", blurb: "Jamoa uchun", points: ["Jamoa workspace", "Cheksiz a'zolar", "Admin boshqaruvi"] },
];

const REVIEWS = [
  {
    text: "Avval WhatsAppda kelishib, keyin Wordda yozardik. Ahd ikkalasini bir joyga qo'ydi — 10 daqiqada imzo qo'ydik.",
    name: "Jasur Karimov",
    role: "Freelance dizayner",
  },
  {
    text: "Pool Qarz oilaviy yig'imni tartibga soldi. Kim qancha bergani ochiq, bahs yo'q.",
    name: "Madina Yusupova",
    role: "Tadbirkor",
  },
  {
    text: "Mijozlarim endi og'zaki va'daga ishonmaydi. Chat + imzo — hammasi Ahd da qoladi.",
    name: "Sardor Aliyev",
    role: "Qurilish pudratchisi",
  },
];

const FOOTER = {
  Mahsulot: [
    { label: "Xususiyatlar", href: "#xususiyatlar" },
    { label: "Pool Qarz", href: "#pool-qarz" },
    { label: "Narxlar", href: "#narxlar" },
  ],
  Kompaniya: [
    { label: "Qanday ishlaydi", href: "#qanday" },
    { label: "Kirish", href: "/login" },
    { label: "Ro'yxatdan o'tish", href: "/register" },
  ],
  "Qo'llab-quvvatlash": [
    { label: "Aloqa", href: "mailto:muhammad@ahd.uz" },
    { label: "Yordam", href: "#narxlar" },
    { label: "Maxfiylik", href: "#" },
  ],
};

export default function HomePage() {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
    return () => document.documentElement.classList.remove("scroll-smooth");
  }, []);

  return (
    <div className="landing-bw min-h-full bg-black text-white">
      <style>{`
        .landing-bw { --border: #222222; --accent: #ffffff; }
        .landing-bw ::selection { background: #333333; color: #ffffff; }
        .landing-bw a:focus-visible,
        .landing-bw button:focus-visible { box-shadow: 0 0 0 2px #ffffff; }
        .landing-bw .ring-black { border-color: #000000 !important; }
        .landing-bw .ring-white { border-color: #ffffff !important; }
        .landing-bw .ring-line { border-color: #222222 !important; }
        .landing-bw .ring-soft { border-color: #333333 !important; }
        .landing-bw .ring-pale { border-color: #cccccc !important; }
        .landing-bw .ring-dash { border-color: #333333 !important; }
      `}</style>
      <header className="sticky top-0 z-40 border-b border-[#222] ring-line bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-[20px] font-bold tracking-tight text-white">
            Ahd
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-[14px] text-[#999] hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden h-10 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-black hover:bg-[#f5f5f5] md:inline-flex"
            >
              Boshlash
            </Link>
            <button
              type="button"
              aria-label="Menyu"
              onClick={() => setMenu((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#333] ring-soft md:hidden"
            >
              <span className="sr-only">Menyu</span>
              <span className="flex w-4 flex-col gap-1">
                <span className="block h-px bg-white" />
                <span className="block h-px bg-white" />
                <span className="block h-px bg-white" />
              </span>
            </button>
          </div>
        </div>
        {menu ? (
          <div className="border-t border-[#222] ring-line px-5 py-4 md:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                className="block py-2.5 text-[15px] text-[#ccc]"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/register"
              className="mt-3 flex h-11 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-black"
            >
              Boshlash
            </Link>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden bg-black">
        <div className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex rounded-full border border-[#333] ring-soft px-3 py-1 text-[12px] tracking-wide text-[#999]">
              AI bilan ishlaydigan
            </span>
            <h1 className="mt-6 text-5xl leading-[1.05] font-black tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Og&apos;zaki kelishuvlar
              <br />
              endi rasmiy
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-7 text-[#999]">
              Chat orqali muzokara qiling, AI shartnoma tuzsin, raqamli imzo qo&apos;ying
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-black hover:bg-[#f5f5f5]"
              >
                Bepul boshlash
              </Link>
              <a
                href="#qanday"
                className="ring-white inline-flex h-12 items-center rounded-full border border-white px-6 text-[15px] font-semibold text-white hover:bg-white hover:text-black"
              >
                Qanday ishlaydi
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-[#666]">
              <span>
                <span className="font-semibold text-white">10,000+</span> kelishuv
              </span>
              <span>
                <span className="font-semibold text-white">98%</span> muvaffaqiyat
              </span>
              <span>
                <span className="font-semibold text-white">2 daqiqa</span>
              </span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneFrame>
              <ChatScreen />
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section id="xususiyatlar" className="scroll-mt-16 bg-white text-black">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-[#666]">XUSUSIYATLAR</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Hamma narsa bir joyda</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => (
              <article
                key={item.title}
                className="ring-black rounded-2xl border border-black bg-[#f5f5f5] p-6 transition hover:shadow-lg"
              >
                <span className="text-[28px]" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-4 text-[18px] font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#666]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="qanday" className="scroll-mt-16 bg-black">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">3 qadamda tayyor</h2>
          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute top-[22px] right-8 left-8 hidden h-px bg-[#333] md:block" />
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <span className="ring-soft relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#333] bg-black text-[13px] font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-[20px] font-bold tracking-tight text-white">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#999]">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="ring-line mt-16 overflow-hidden rounded-3xl border border-[#222] bg-[#111] p-4 shadow-2xl md:p-8">
            <DeskMock />
          </div>
        </div>
      </section>

      <section id="pool-qarz" className="scroll-mt-16 bg-[#f5f5f5] text-black">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
          <div>
            <span className="ring-black inline-flex rounded-full border border-black px-3 py-1 text-[11px] font-bold tracking-[0.14em]">
              YANGI
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Pool Qarz — Guruh kreditlash</h2>
            <p className="mt-5 max-w-md text-[16px] leading-7 text-[#666]">
              Bir kishi so&apos;raydi, do&apos;stlar yig&apos;adi. Kim qancha qo&apos;shgani, qancha qolgani va qaytarish
              muddati hammaga ochiq.
            </p>
            <ul className="mt-8 space-y-3">
              {POOL_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[12px] text-white">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <PhoneFrame light>
              <PoolScreen />
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section className="bg-white text-black">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-24 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-5xl font-black tracking-tight text-black">{stat.value}</p>
              <p className="mt-2 text-[14px] text-[#666]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="narxlar" className="scroll-mt-16 bg-[#f5f5f5] text-black">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-[#666]">NARXLAR</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Oddiy tariflar</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.featured ? "ring-black border-black bg-black text-white" : "ring-pale border-[#ccc] bg-white"
                }`}
              >
                <p className="text-[13px] font-semibold tracking-wide uppercase opacity-70">{plan.name}</p>
                <p className="mt-3 text-4xl font-black tracking-tight">
                  {plan.price}
                  <span className="ml-1 text-[14px] font-medium opacity-60">{plan.period}</span>
                </p>
                <p className="mt-2 text-[14px] opacity-70">{plan.blurb}</p>
                <ul className="mt-6 space-y-2 text-[14px]">
                  {plan.points.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 flex h-11 items-center justify-center rounded-full text-[14px] font-semibold ${
                    plan.featured ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  Boshlash
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Foydalanuvchilar aytadi</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((item) => (
              <blockquote key={item.name} className="rounded-2xl bg-[#111] p-6">
                <p className="text-[15px] leading-7 text-white">&ldquo;{item.text}&rdquo;</p>
                <footer className="mt-6">
                  <p className="text-[14px] font-semibold text-[#999]">{item.name}</p>
                  <p className="text-[13px] text-[#666]">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <span className="ring-soft inline-flex animate-pulse rounded-full border border-[#333] px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#ccc]">
            TEZ ORADA
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Yangi imkoniyatlar</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="ring-dash rounded-2xl border border-dashed border-[#333] bg-[#1a1a1a]/80 p-6">
              <p className="text-[13px] text-[#666]">🔒 Tez orada</p>
              <h3 className="mt-3 text-[22px] font-bold text-white">🎙️ Ovozli kelishuvlar</h3>
              <p className="mt-2 text-[14px] text-[#999]">Gaplashing, AI yozib olsin</p>
            </article>
            <article className="ring-dash rounded-2xl border border-dashed border-[#333] bg-[#1a1a1a]/80 p-6">
              <p className="text-[13px] text-[#666]">🔒 Tez orada</p>
              <h3 className="mt-3 text-[22px] font-bold text-white">✈️ Telegram Mini App</h3>
              <p className="mt-2 text-[14px] text-[#999]">To&apos;g&apos;ridan-to&apos;g&apos;ri Telegramda</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white text-black">
        <div className="mx-auto max-w-3xl px-5 py-28 text-center">
          <h2 className="text-5xl font-black tracking-tight sm:text-6xl">Bugun boshlang</h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[#666]">
            Birinchi kelishuvingizni bepul tuzing. Kartasiz, navbatsiz.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-14 items-center rounded-full bg-black px-8 text-[16px] font-semibold text-white hover:bg-[#111]"
          >
            Bepul ro&apos;yxatdan o&apos;tish
          </Link>
          <p className="mt-4 text-[13px] text-[#999]">Kredit kartasi shart emas</p>
        </div>
      </section>

      <footer className="border-t border-[#222] ring-line bg-black">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <p className="text-[20px] font-bold text-white">Ahd</p>
              <p className="mt-2 text-[14px] leading-6 text-[#666]">So&apos;zingiz hujjat bo&apos;lsin.</p>
              <div className="mt-5 flex gap-3 text-[13px] text-[#666]">
                <span className="ring-soft flex h-9 w-9 items-center justify-center rounded-full border border-[#333]">Tg</span>
                <span className="ring-soft flex h-9 w-9 items-center justify-center rounded-full border border-[#333]">Ig</span>
                <span className="ring-soft flex h-9 w-9 items-center justify-center rounded-full border border-[#333]">X</span>
              </div>
            </div>
            {Object.entries(FOOTER).map(([title, links]) => (
              <div key={title}>
                <p className="text-[13px] font-semibold tracking-wide text-[#999] uppercase">{title}</p>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-[14px] text-[#666] hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-14 text-[13px] text-[#666]">© 2024 Ahd. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}

function PhoneFrame({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`ring-line w-[min(100%,280px)] rounded-[2.5rem] border-[8px] shadow-2xl ${
        light ? "border-[#111] bg-white" : "border-[#222] bg-[#1a1a1a]"
      }`}
    >
      <div className="mx-auto mt-3 h-5 w-20 rounded-full bg-[#111]" />
      <div className="p-3 pb-5">{children}</div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="rounded-2xl bg-[#111] p-3">
      <p className="mb-3 text-center text-[11px] font-semibold text-[#666]">Jasur · Ijrochi</p>
      <div className="space-y-2">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#333] px-3 py-2 text-[12px] leading-4 text-[#f5f5f5]">
          Logo va landing 5 kunda, 3 000 000 so&apos;m.
        </p>
        <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-3 py-2 text-[12px] leading-4 text-black">
          Avans 40%, qolgani topshirishda.
        </p>
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#333] px-3 py-2 text-[12px] leading-4 text-[#f5f5f5]">
          Kelishdik. Hujjatni tuzamizmi?
        </p>
        <div className="ring-soft rounded-2xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-white">Kelishuv tayyor ✓</p>
          <p className="mt-1 text-[11px] text-[#999]">AI qoralama · imzo kutilmoqda</p>
        </div>
      </div>
    </div>
  );
}

function PoolScreen() {
  return (
    <div className="rounded-2xl bg-white p-3 text-black">
      <p className="text-[11px] font-semibold text-[#666]">Pool Qarz</p>
      <p className="mt-1 text-[22px] font-black tracking-tight">12 000 000</p>
      <p className="text-[11px] text-[#999]">so&apos;m · ta&apos;lim</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f5f5f5]">
        <div className="h-full w-2/3 rounded-full bg-black" />
      </div>
      <p className="mt-2 text-[11px] text-[#666]">8 000 000 / 12 000 000 · 67%</p>
      <div className="mt-4 space-y-2">
        {[
          ["MK", "Madina", "4 000 000"],
          ["SA", "Sardor", "4 000 000"],
        ].map(([ini, name, sum]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              {ini}
            </span>
            <span className="flex-1 text-[12px]">{name}</span>
            <span className="text-[12px] font-semibold">{sum}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeskMock() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl bg-[#1a1a1a] p-4">
        <p className="text-[12px] font-semibold text-[#666]">Chat</p>
        <div className="mt-3 space-y-2">
          <p className="max-w-[80%] rounded-xl bg-[#333] px-3 py-2 text-[13px] text-[#f5f5f5]">
            Muddat — 12-oktabr. Kehikish 1% / kun.
          </p>
          <p className="ml-auto max-w-[75%] rounded-xl bg-white px-3 py-2 text-[13px] text-black">
            Qabul. Imzolayman.
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-[#0a0a0a] p-4">
        <p className="text-[12px] font-semibold text-[#666]">Hujjat</p>
        <p className="mt-3 text-[16px] font-bold text-white">1. Tomonlar</p>
        <p className="mt-2 text-[13px] leading-5 text-[#999]">Tomon A — Mijoz: Muhammad</p>
        <p className="text-[13px] leading-5 text-[#999]">Tomon B — Ijrochi: Jasur</p>
        <div className="ring-dash mt-4 h-8 rounded-lg border border-dashed border-[#333]" />
        <div className="ring-dash mt-2 h-8 rounded-lg border border-dashed border-[#333]" />
      </div>
    </div>
  );
}
