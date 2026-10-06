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

export default function HomePage() {
  const [menu, setMenu] = useState(false);

  return (
    <SmoothScroll>
    <div className="landing min-h-full bg-[#f5f5f5] text-[#111]">
      <style>{`
        .landing { --border: #e5e5e5; --accent: #111111; }
        .landing ::selection { background: #111; color: #fff; }
        .landing a:focus-visible,
        .landing button:focus-visible { box-shadow: 0 0 0 2px #111; }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-[#f5f5f5]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-[20px] font-bold tracking-tight text-[#111]">
            Ahd
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-[14px] text-[#666] hover:text-[#111]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden h-10 items-center rounded-full bg-[#111] px-5 text-[14px] font-semibold text-white hover:bg-black md:inline-flex"
            >
              Boshlash
            </Link>
            <button
              type="button"
              aria-label="Menyu"
              onClick={() => setMenu((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] md:hidden"
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
          <div className="border-t border-[#e5e5e5] px-5 py-4 md:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                className="block py-2.5 text-[15px] text-[#333]"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/register"
              className="mt-3 flex h-11 items-center justify-center rounded-full bg-[#111] text-[14px] font-semibold text-white"
            >
              Boshlash
            </Link>
          </div>
        ) : null}
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight text-[#111] sm:text-5xl lg:text-[52px]">
            Do&apos;stingizdan qarz oldingizmi? Ishchi yolladingizmi? Ahd bilan kelishuvni rasmiylashtiring.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-7 text-[#666]">
            Chat orqali gaplashing — AI shartnoma tuzib beradi. 2 daqiqada, bepul.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center rounded-full bg-[#111] px-6 text-[15px] font-semibold text-white hover:bg-black"
            >
              Bepul boshlash
            </Link>
            <a
              href="#qanday"
              className="inline-flex h-12 items-center rounded-full border border-[#ccc] bg-white px-6 text-[15px] font-semibold text-[#111] hover:border-[#111]"
            >
              Qanday ishlaydi
            </a>
          </div>
        </div>
      </section>

      <section id="muammo" className="scroll-mt-16 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#888] uppercase">Nima uchun Ahd?</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Muammo nima?</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Ko&apos;pchilik hali ham og&apos;zaki kelishadi. Keyin esdan chiqadi, bahs chiqadi, pul yo&apos;qoladi.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
              <article key={item.title} className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
                <h3 className="text-[18px] font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#666]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="qanday" className="scroll-mt-16 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#888] uppercase">Yechim</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Ahd qanday yordam beradi?</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Uch qadam. Advokatsiz. Word ochmasdan. Ikkalangiz chatda qolasiz — hujjat o&apos;zi chiqadi.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
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
              <article key={step.n} className="rounded-2xl border border-[#e5e5e5] bg-[#f5f5f5] p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111] text-[14px] font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-[18px] font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#666]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="xususiyatlar" className="scroll-mt-16 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#888] uppercase">Xususiyatlar</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Hamma narsa bir joyda</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Muzokara, hujjat, imzo va ishonch — bitta ilovada. Alohida Word, PDF yoki advokat kerak emas.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <article key={item.title} className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
                <span className="text-[24px]" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-4 text-[17px] font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#666]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Foydalanuvchilar aytadi</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Oddiy odamlar — freelancer, tadbirkor, pudratchi. Ular Ahdni nima uchun ishlatishini o&apos;zlari aytadi.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
              <blockquote key={item.name} className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
                <p className="text-[15px] leading-7 text-[#222]">&ldquo;{item.text}&rdquo;</p>
                <footer className="mt-6">
                  <p className="text-[14px] font-semibold">{item.name}</p>
                  <p className="text-[13px] text-[#888]">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex animate-pulse rounded-full border border-[#ddd] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#888]">
            TEZ ORADA
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Yangi imkoniyatlar</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Hozir yozasiz. Tez orada gapirasiz — yoki umuman Telegramdan chiqmasdan ishlaysiz.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-6">
              <p className="text-[13px] text-[#888]">🔒 Tez orada</p>
              <h3 className="mt-3 text-[20px] font-bold">Ovozli kelishuvlar</h3>
              <p className="mt-2 text-[14px] leading-6 text-[#666]">
                Gaplashing, AI yozib olsin. Og&apos;zaki muzokara ham shartnomaga aylanadi.
              </p>
            </article>
            <article className="rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-6">
              <p className="text-[13px] text-[#888]">🔒 Tez orada</p>
              <h3 className="mt-3 text-[20px] font-bold">Telegram Mini App</h3>
              <p className="mt-2 text-[14px] leading-6 text-[#666]">
                To&apos;g&apos;ridan-to&apos;g&apos;ri Telegramda. Ilovani ochmasdan kelishing va imzolang.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="narxlar" className="scroll-mt-16 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#888] uppercase">Narxlar</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tariflar</h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#666]">
            Birinchi kelishuv bepul. Keyin ishingiz o&apos;ssin — tarif ham o&apos;sadi.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
                className={`rounded-2xl border p-6 ${
                  plan.featured ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                }`}
              >
                <p className="text-[13px] font-semibold tracking-wide uppercase opacity-70">{plan.name}</p>
                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {plan.price}
                  <span className="ml-1 text-[14px] font-medium opacity-60">{plan.period}</span>
                </p>
                <p className={`mt-2 text-[14px] ${plan.featured ? "text-[#aaa]" : "text-[#666]"}`}>{plan.blurb}</p>
                <ul className="mt-6 space-y-2 text-[14px]">
                  {plan.points.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 flex h-11 items-center justify-center rounded-full text-[14px] font-semibold ${
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

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#e5e5e5] bg-white px-6 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Bugun birinchi kelishuvingizni tuzing — bepul
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-[#666]">
            Ro&apos;yxatdan o&apos;ting, sherikni chaqiring, chatda gaplashing. Hujjatni AI yozadi.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-[#111] px-8 text-[15px] font-semibold text-white hover:bg-black"
          >
            Bepul ro&apos;yxatdan o&apos;tish
          </Link>
          <p className="mt-4 text-[13px] text-[#999]">Kredit kartasi shart emas</p>
        </div>
      </section>

      <footer className="border-t border-[#e5e5e5] bg-[#f5f5f5]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-[18px] font-bold">Ahd</p>
              <p className="mt-2 text-[14px] leading-6 text-[#666]">So&apos;zingiz hujjat bo&apos;lsin.</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#888]">Mahsulot</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#xususiyatlar" className="text-[14px] text-[#666] hover:text-[#111]">
                    Xususiyatlar
                  </a>
                </li>
                <li>
                  <a href="#narxlar" className="text-[14px] text-[#666] hover:text-[#111]">
                    Narxlar
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#888]">Kompaniya</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#qanday" className="text-[14px] text-[#666] hover:text-[#111]">
                    Qanday ishlaydi
                  </a>
                </li>
                <li>
                  <Link href="/login" className="text-[14px] text-[#666] hover:text-[#111]">
                    Kirish
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-[14px] text-[#666] hover:text-[#111]">
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#888]">Qo&apos;llab-quvvatlash</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="tel:+971566066729" className="text-[14px] text-[#666] hover:text-[#111]">
                    Aloqa
                  </a>
                </li>
                <li>
                  <a href="#narxlar" className="text-[14px] text-[#666] hover:text-[#111]">
                    Yordam
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-12 text-[13px] text-[#999]">© 2026 Ahd. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
    </SmoothScroll>
  );
}
