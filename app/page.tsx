"use client";

import { useState } from "react";
import Link from "next/link";
import { SmoothScroll } from "@/components/smooth-scroll";

const NAV = [
  { href: "#muammo", label: "Muammo" },
  { href: "#qanday", label: "Qanday ishlaydi" },
  { href: "#xususiyatlar", label: "Xususiyatlar" },
  { href: "#narxlar", label: "Narxlar" },
];

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-16 xl:max-w-7xl";
const H1 = "text-4xl font-bold leading-[1.12] tracking-tight text-[#111] md:text-6xl lg:text-7xl";
const H2 = "text-3xl font-bold tracking-tight text-[#111] md:text-5xl lg:text-6xl";
const LEAD = "mt-3 max-w-xl text-base leading-7 text-[#666] md:mt-4 md:text-lg";
const CARD_TITLE = "text-lg font-bold tracking-tight md:text-xl";
const CARD_BODY = "mt-2 text-sm leading-6 text-[#666] md:text-base";
const GRID3 =
  "mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6";
const SECTION = "scroll-mt-20 py-12 sm:py-16 md:py-20 lg:py-24";

export default function HomePage() {
  const [menu, setMenu] = useState(false);

  return (
    <SmoothScroll>
      <div className="landing min-h-full overflow-x-clip bg-[#f5f5f5] text-[#111]">
        <style>{`
          .landing { --border: #e5e5e5; --accent: #111111; }
          .landing ::selection { background: #111; color: #fff; }
          .landing a:focus-visible,
          .landing button:focus-visible { box-shadow: 0 0 0 2px #111; }
        `}</style>

        <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-[#f5f5f5]/90 backdrop-blur">
          <div className={`${SHELL} flex h-14 items-center justify-between gap-3 sm:h-16`}>
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-[#111] sm:text-xl">
              Ahd
            </Link>
            <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-[#666] hover:text-[#111]">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/register"
                className="hidden h-10 items-center rounded-full bg-[#111] px-5 text-sm font-semibold text-white hover:bg-black lg:inline-flex"
              >
                Boshlash
              </Link>
              <button
                type="button"
                aria-label="Menyu"
                aria-expanded={menu}
                onClick={() => setMenu((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] lg:hidden"
              >
                <span className="sr-only">Menyu</span>
                <span className="flex w-4 flex-col gap-1">
                  <span className="block h-px bg-[#111]" />
                  <span className="block h-px bg-[#111]" />
                  <span className="block h-px bg-[#111]" />
                </span>
              </button>
            </div>
          </div>
          {menu ? (
            <div className={`${SHELL} border-t border-[#e5e5e5] py-4 lg:hidden`}>
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenu(false)}
                  className="block py-2.5 text-base text-[#333]"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/register"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-[#111] text-sm font-semibold text-white"
              >
                Boshlash
              </Link>
            </div>
          ) : null}
        </header>

        <section className={`${SHELL} flex flex-col items-center py-12 text-center sm:py-16 md:py-20 lg:py-28`}>
          <h1 className={`${H1} max-w-5xl`}>
            Do&apos;stingizdan qarz oldingizmi? Ishchi yolladingizmi? Ahd bilan kelishuvni rasmiylashtiring.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#666] sm:mt-5 md:text-lg lg:text-xl">
            Chat orqali gaplashing — AI shartnoma tuzib beradi. 2 daqiqada, bepul.
          </p>
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111] px-6 text-[15px] font-semibold text-white hover:bg-black sm:w-auto"
            >
              Bepul boshlash
            </Link>
            <a
              href="#qanday"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#ccc] bg-white px-6 text-[15px] font-semibold text-[#111] hover:border-[#111] sm:w-auto"
            >
              Qanday ishlaydi
            </a>
          </div>
        </section>

        <section id="muammo" className={SECTION}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">Nima uchun Ahd?</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>Muammo nima?</h2>
            <p className={LEAD}>
              Ko&apos;pchilik hali ham og&apos;zaki kelishadi. Keyin esdan chiqadi, bahs chiqadi, pul yo&apos;qoladi.
            </p>
            <div className={GRID3}>
              {[
                {
                  title: "Og'zaki kelishuvlar unutiladi",
                  body: "Do'stingizga pul berdingiz. Ikkalangiz ham eslaysiz — toki kelishmovchilik chiqmaguncha. Yozma dalil yo'q.",
                },
                {
                  title: "Advokat qimmat, vaqt yo'q",
                  body: "Oddiy qarz yoki ish uchun advokat chaqirish qimmat. Ahd shu ishni 2 daqiqada, chat orqali qiladi.",
                },
                {
                  title: "Telegram xabari hujjat emas",
                  body: "Chatda yozilgan shart sudda zaif. Ahd suhbatni yuridik kuchga ega shartnomaga aylantiradi.",
                },
              ].map((item) => (
                <article key={item.title} className="min-w-0 rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6">
                  <h3 className={CARD_TITLE}>{item.title}</h3>
                  <p className={CARD_BODY}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="qanday" className={`${SECTION} bg-white`}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">Yechim</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>Ahd qanday yordam beradi?</h2>
            <p className={LEAD}>
              Uch qadam. Advokatsiz. Word ochmasdan. Ikkalangiz chatda qolasiz — hujjat o&apos;zi chiqadi.
            </p>
            <div className={GRID3}>
              {[
                {
                  n: "1",
                  title: "Sherigingizni taklif qiling",
                  body: "Email yoki havola yuboring. U qabul qilgach, umumiy chat ochiladi — ikkalangiz ham ko'rasiz.",
                },
                {
                  n: "2",
                  title: "Chat orqali shartlarni belgilang",
                  body: "Summa, muddat, avans — oddiy tilda yozing. WhatsAppdagi kabi, lekin hammasi saqlanadi.",
                },
                {
                  n: "3",
                  title: "AI tuzadi, ikkalangiz imzolaysiz",
                  body: "AI suhbatdan shartnoma yasaydi. Siz va sherigingiz raqamli imzo qo'yasiz — ish yakun.",
                },
              ].map((step) => (
                <article key={step.n} className="min-w-0 rounded-2xl border border-[#e5e5e5] bg-[#f5f5f5] p-5 sm:p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111] text-sm font-bold text-white">
                    {step.n}
                  </span>
                  <h3 className={`${CARD_TITLE} mt-5`}>{step.title}</h3>
                  <p className={CARD_BODY}>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="xususiyatlar" className={SECTION}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">Xususiyatlar</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>Hamma narsa bir joyda</h2>
            <p className={LEAD}>
              Muzokara, hujjat, imzo va ishonch — bitta ilovada. Alohida Word, PDF yoki advokat kerak emas.
            </p>
            <div className={GRID3}>
              {[
                {
                  icon: "📄",
                  title: "AI Kelishuv",
                  body: "Siz chatda gaplashasiz. AI shartlarni o'qib, tayyor shartnoma chiqaradi. Qoralamani tuzatishingiz mumkin.",
                },
                {
                  icon: "✍️",
                  title: "Raqamli Imzo",
                  body: "Har ikki tomon elektron imzo qo'yadi. Hujjat yuklab olinadi va arxivda qoladi.",
                },
                {
                  icon: "💬",
                  title: "Real-vaqt Chat",
                  body: "WhatsAppdagi kabi yozishasiz. Farqi: suhbat keyin shartnomaga aylanadi, yo'qolmaydi.",
                },
                {
                  icon: "🤖",
                  title: "AI Vositachi",
                  body: "Nima unutilganini aytadi: muddat, avans, kechikish. Tinch muzokara — adolatli shartlar.",
                },
                {
                  icon: "⭐",
                  title: "Reyting tizimi",
                  body: "Ish yakunida baho qoldirasiz. Keyingi safar ishonchli odamni oldindan ko'rasiz.",
                },
              ].map((item) => (
                <article key={item.title} className="min-w-0 rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6">
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className={`${CARD_TITLE} mt-4`}>{item.title}</h3>
                  <p className={CARD_BODY}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={SECTION}>
          <div className={SHELL}>
            <h2 className={H2}>Foydalanuvchilar aytadi</h2>
            <p className={LEAD}>
              Oddiy odamlar — freelancer, tadbirkor, pudratchi. Ular Ahdni nima uchun ishlatishini o&apos;zlari aytadi.
            </p>
            <div className={GRID3}>
              {[
                {
                  text: "Mijoz logo so'radi. Avval WhatsAppda kelishib, keyin Word ochardim. Endi chat + imzo bir joyda — 10 daqiqada tugadi.",
                  name: "Jasur Karimov",
                  role: "Freelance dizayner",
                },
                {
                  text: "Yetkazib beruvchi bilan avval og'zaki kelishardik. Endi chatda yozamiz, imzo qo'yamiz — bahs yo'q.",
                  name: "Madina Yusupova",
                  role: "Tadbirkor",
                },
                {
                  text: "Ishchilarga og'zaki va'da qilardim. Keyin 'aytmagan edingiz' degani chiqardi. Ahd da yozilgan va imzolangan.",
                  name: "Sardor Aliyev",
                  role: "Qurilish pudratchisi",
                },
              ].map((item) => (
                <blockquote key={item.name} className="min-w-0 rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6">
                  <p className="text-[15px] leading-7 text-[#222] md:text-base">&ldquo;{item.text}&rdquo;</p>
                  <footer className="mt-6">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-sm text-[#888]">{item.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className={`${SECTION} bg-white`}>
          <div className={SHELL}>
            <span className="inline-flex animate-pulse rounded-full border border-[#ddd] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#888]">
              TEZ ORADA
            </span>
            <h2 className={`${H2} mt-4`}>Yangi imkoniyatlar</h2>
            <p className={LEAD}>
              Hozir yozasiz. Tez orada gapirasiz — yoki umuman Telegramdan chiqmasdan ishlaysiz.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 lg:gap-6">
              <article className="min-w-0 rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-5 sm:p-6">
                <p className="text-sm text-[#888]">🔒 Tez orada</p>
                <h3 className={`${CARD_TITLE} mt-3`}>Ovozli kelishuvlar</h3>
                <p className={CARD_BODY}>
                  Gaplashing, AI yozib olsin. Og&apos;zaki muzokara ham shartnomaga aylanadi.
                </p>
              </article>
              <article className="min-w-0 rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-5 sm:p-6">
                <p className="text-sm text-[#888]">🔒 Tez orada</p>
                <h3 className={`${CARD_TITLE} mt-3`}>Telegram Mini App</h3>
                <p className={CARD_BODY}>
                  To&apos;g&apos;ridan-to&apos;g&apos;ri Telegramda. Ilovani ochmasdan kelishing va imzolang.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="narxlar" className={SECTION}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">Narxlar</p>
            <h2 className={`${H2} mt-3`}>Tariflar</h2>
            <p className={LEAD}>Birinchi kelishuv bepul. Keyin ishingiz o&apos;ssin — tarif ham o&apos;sadi.</p>
            <div className={GRID3}>
              {[
                {
                  name: "Free",
                  price: "0",
                  period: "so'm",
                  blurb: "Sinab ko'rish va birinchi hujjat uchun",
                  points: ["2 ta kelishuv / oy", "AI qoralama", "PDF yuklash"],
                  featured: false,
                },
                {
                  name: "Pro",
                  price: "49 000",
                  period: "so'm/oy",
                  blurb: "Doimiy ish va cheksiz kelishuv",
                  points: ["Cheksiz kelishuv", "AI vositachi", "Raqamli imzo"],
                  featured: true,
                },
                {
                  name: "Business",
                  price: "149 000",
                  period: "so'm/oy",
                  blurb: "Jamoa va bir nechta xodim uchun",
                  points: ["Jamoa workspace", "Cheksiz a'zolar", "Admin boshqaruvi"],
                  featured: false,
                },
              ].map((plan) => (
                <article
                  key={plan.name}
                  className={`flex min-w-0 flex-col rounded-2xl border p-5 sm:p-6 ${
                    plan.featured ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold tracking-wide uppercase opacity-70">{plan.name}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                    {plan.price}
                    <span className="ml-1 text-sm font-medium opacity-60">{plan.period}</span>
                  </p>
                  <p className={`mt-2 text-sm md:text-base ${plan.featured ? "text-[#aaa]" : "text-[#666]"}`}>
                    {plan.blurb}
                  </p>
                  <ul className="mt-6 space-y-2 text-sm md:text-base">
                    {plan.points.map((p) => (
                      <li key={p}>✓ {p}</li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`mt-8 flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold ${
                      plan.featured ? "bg-white text-[#111]" : "bg-[#111] text-white"
                    }`}
                  >
                    Boshlash
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 sm:pb-16 md:px-8 md:pb-20 lg:px-16">
          <div className="mx-auto max-w-6xl rounded-2xl border border-[#e5e5e5] bg-white px-5 py-12 text-center sm:rounded-3xl sm:px-8 sm:py-16 md:px-12 lg:py-20 xl:max-w-7xl">
            <h2 className={H2}>Bugun birinchi kelishuvingizni tuzing — bepul</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#666] md:text-lg">
              Ro&apos;yxatdan o&apos;ting, sherikni chaqiring, chatda gaplashing. Hujjatni AI yozadi.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-[#111] px-8 text-[15px] font-semibold text-white hover:bg-black sm:w-auto"
            >
              Bepul ro&apos;yxatdan o&apos;tish
            </Link>
            <p className="mt-4 text-sm text-[#999]">Kredit kartasi shart emas</p>
          </div>
        </section>

        <footer className="border-t border-[#e5e5e5] bg-[#f5f5f5]">
          <div className={`${SHELL} py-10 sm:py-12 md:py-14`}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
              <div className="min-w-0">
                <p className="text-lg font-bold">Ahd</p>
                <p className="mt-2 text-sm leading-6 text-[#666]">So&apos;zingiz hujjat bo&apos;lsin.</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">Mahsulot</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="#xususiyatlar" className="text-sm text-[#666] hover:text-[#111]">
                      Xususiyatlar
                    </a>
                  </li>
                  <li>
                    <a href="#narxlar" className="text-sm text-[#666] hover:text-[#111]">
                      Narxlar
                    </a>
                  </li>
                </ul>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">Kompaniya</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="#qanday" className="text-sm text-[#666] hover:text-[#111]">
                      Qanday ishlaydi
                    </a>
                  </li>
                  <li>
                    <Link href="/login" className="text-sm text-[#666] hover:text-[#111]">
                      Kirish
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-sm text-[#666] hover:text-[#111]">
                      Ro&apos;yxatdan o&apos;tish
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">Qo&apos;llab-quvvatlash</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="tel:+971566066729" className="text-sm text-[#666] hover:text-[#111]">
                      Aloqa
                    </a>
                  </li>
                  <li>
                    <a href="#narxlar" className="text-sm text-[#666] hover:text-[#111]">
                      Yordam
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-10 text-sm text-[#999] md:mt-12">© 2026 Ahd. Barcha huquqlar himoyalangan.</p>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
