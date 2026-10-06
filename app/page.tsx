"use client";

import { useState } from "react";
import Link from "next/link";
import { SmoothScroll } from "@/components/smooth-scroll";

type Lang = "uz" | "en";

const translations = {
  uz: {
    navProblem: "Muammo",
    navHow: "Qanday ishlaydi",
    navFeatures: "Xususiyatlar",
    navPricing: "Narxlar",
    start: "Boshlash",
    menu: "Menyu",
    heroTitle: "Do'stingizdan qarz oldingizmi? Ishchi yolladingizmi? Ahd bilan kelishuvni rasmiylashtiring.",
    heroLead: "Chat orqali gaplashing — AI shartnoma tuzib beradi. 2 daqiqada, bepul.",
    heroCta: "Bepul boshlash",
    heroSecondary: "Qanday ishlaydi",
    whyEyebrow: "Nima uchun Ahd?",
    whyTitle: "Muammo nima?",
    whyLead: "Ko'pchilik hali ham og'zaki kelishadi. Keyin esdan chiqadi, bahs chiqadi, pul yo'qoladi.",
    problems: [
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
    ],
    howEyebrow: "Yechim",
    howTitle: "Ahd qanday yordam beradi?",
    howLead: "Uch qadam. Advokatsiz. Word ochmasdan. Ikkalangiz chatda qolasiz — hujjat o'zi chiqadi.",
    steps: [
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
    ],
    featuresEyebrow: "Xususiyatlar",
    featuresTitle: "Hamma narsa bir joyda",
    featuresLead: "Muzokara, hujjat, imzo va ishonch — bitta ilovada. Alohida Word, PDF yoki advokat kerak emas.",
    features: [
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
    ],
    quotesTitle: "Foydalanuvchilar aytadi",
    quotesLead: "Oddiy odamlar — freelancer, tadbirkor, pudratchi. Ular Ahdni nima uchun ishlatishini o'zlari aytadi.",
    quotes: [
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
    ],
    soonBadge: "TEZ ORADA",
    soonTitle: "Yangi imkoniyatlar",
    soonLead: "Hozir yozasiz. Tez orada gapirasiz — yoki umuman Telegramdan chiqmasdan ishlaysiz.",
    soonLock: "🔒 Tez orada",
    soonVoiceTitle: "Ovozli kelishuvlar",
    soonVoiceBody: "Gaplashing, AI yozib olsin. Og'zaki muzokara ham shartnomaga aylanadi.",
    soonTgTitle: "Telegram Mini App",
    soonTgBody: "To'g'ridan-to'g'ri Telegramda. Ilovani ochmasdan kelishing va imzolang.",
    pricingEyebrow: "Narxlar",
    pricingTitle: "Tariflar",
    pricingLead: "Birinchi kelishuv bepul. Keyin ishingiz o'ssin — tarif ham o'sadi.",
    plans: [
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
    ],
    ctaTitle: "Bugun birinchi kelishuvingizni tuzing — bepul",
    ctaLead: "Ro'yxatdan o'ting, sherikni chaqiring, chatda gaplashing. Hujjatni AI yozadi.",
    ctaButton: "Bepul ro'yxatdan o'tish",
    ctaNote: "Kredit kartasi shart emas",
    footerTagline: "So'zingiz hujjat bo'lsin.",
    footerProduct: "Mahsulot",
    footerCompany: "Kompaniya",
    footerSupport: "Qo'llab-quvvatlash",
    footerLogin: "Kirish",
    footerRegister: "Ro'yxatdan o'tish",
    footerContact: "Aloqa",
    footerHelp: "Yordam",
    footerCopy: "© 2026 Ahd. Barcha huquqlar himoyalangan.",
  },
  en: {
    navProblem: "Problem",
    navHow: "How it works",
    navFeatures: "Features",
    navPricing: "Pricing",
    start: "Get started",
    menu: "Menu",
    heroTitle: "Borrowed from a friend? Hired someone? Put the agreement in writing with Ahd.",
    heroLead: "Talk in chat — AI drafts the contract. In 2 minutes, for free.",
    heroCta: "Start for free",
    heroSecondary: "How it works",
    whyEyebrow: "Why Ahd?",
    whyTitle: "What's the problem?",
    whyLead: "Most people still agree verbally. Then it is forgotten, a dispute starts, and money is lost.",
    problems: [
      {
        title: "Verbal deals are forgotten",
        body: "You lent a friend money. You both remember — until a disagreement. There is no written proof.",
      },
      {
        title: "Lawyers are expensive, time is short",
        body: "Calling a lawyer for a simple loan or job is expensive. Ahd does it in 2 minutes, in chat.",
      },
      {
        title: "A Telegram message is not a document",
        body: "Terms written in chat are weak in court. Ahd turns the conversation into a legally binding contract.",
      },
    ],
    howEyebrow: "The solution",
    howTitle: "How does Ahd help?",
    howLead: "Three steps. No lawyer. No Word. You both stay in chat — the document writes itself.",
    steps: [
      {
        n: "1",
        title: "Invite your counterpart",
        body: "Send an email or a link. When they accept, a shared chat opens — you both see it.",
      },
      {
        n: "2",
        title: "Set the terms in chat",
        body: "Amount, deadline, advance — write in plain language. Like WhatsApp, but everything is saved.",
      },
      {
        n: "3",
        title: "AI drafts, you both sign",
        body: "AI builds a contract from the conversation. You and your counterpart add a digital signature — done.",
      },
    ],
    featuresEyebrow: "Features",
    featuresTitle: "Everything in one place",
    featuresLead: "Negotiation, document, signature, and trust — one app. No separate Word, PDF, or lawyer.",
    features: [
      {
        icon: "📄",
        title: "AI Agreement",
        body: "You talk in chat. AI reads the terms and produces a ready contract. You can edit the draft.",
      },
      {
        icon: "✍️",
        title: "Digital Signature",
        body: "Both parties sign electronically. The document is downloaded and kept in the archive.",
      },
      {
        icon: "💬",
        title: "Real-time Chat",
        body: "You write like in WhatsApp. The difference: the conversation becomes a contract and is not lost.",
      },
      {
        icon: "🤖",
        title: "AI Mediator",
        body: "It flags what was forgotten: deadline, advance, delay. Calm negotiation — fair terms.",
      },
      {
        icon: "⭐",
        title: "Rating system",
        body: "When the work is done you leave a rating. Next time you see a trustworthy person in advance.",
      },
    ],
    quotesTitle: "What users say",
    quotesLead: "Ordinary people — freelancer, entrepreneur, contractor. They say themselves why they use Ahd.",
    quotes: [
      {
        text: "A client asked for a logo. I used to agree on WhatsApp, then open Word. Now chat + signature are in one place — done in 10 minutes.",
        name: "Jasur Karimov",
        role: "Freelance designer",
      },
      {
        text: "We used to agree with suppliers verbally. Now we write in chat and sign — no more disputes.",
        name: "Madina Yusupova",
        role: "Entrepreneur",
      },
      {
        text: "I used to make verbal promises to workers. Then it was 'you never said that.' With Ahd it is written and signed.",
        name: "Sardor Aliyev",
        role: "Construction contractor",
      },
    ],
    soonBadge: "COMING SOON",
    soonTitle: "New capabilities",
    soonLead: "You write today. Soon you will speak — or work without leaving Telegram at all.",
    soonLock: "🔒 Coming soon",
    soonVoiceTitle: "Voice agreements",
    soonVoiceBody: "Talk, let AI take notes. Spoken negotiation becomes a contract too.",
    soonTgTitle: "Telegram Mini App",
    soonTgBody: "Straight in Telegram. Agree and sign without opening the app.",
    pricingEyebrow: "Pricing",
    pricingTitle: "Plans",
    pricingLead: "The first agreement is free. Then as your work grows — so does the plan.",
    plans: [
      {
        name: "Free",
        price: "0",
        period: "UZS",
        blurb: "For trying it out and the first document",
        points: ["2 agreements / month", "AI draft", "PDF download"],
        featured: false,
      },
      {
        name: "Pro",
        price: "49 000",
        period: "UZS/mo",
        blurb: "For ongoing work and unlimited agreements",
        points: ["Unlimited agreements", "AI mediator", "Digital signature"],
        featured: true,
      },
      {
        name: "Business",
        price: "149 000",
        period: "UZS/mo",
        blurb: "For a team and several employees",
        points: ["Team workspace", "Unlimited members", "Admin controls"],
        featured: false,
      },
    ],
    ctaTitle: "Make your first agreement today — free",
    ctaLead: "Sign up, invite a counterpart, talk in chat. AI writes the document.",
    ctaButton: "Sign up for free",
    ctaNote: "No credit card required",
    footerTagline: "Your word becomes a document.",
    footerProduct: "Product",
    footerCompany: "Company",
    footerSupport: "Support",
    footerLogin: "Log in",
    footerRegister: "Sign up",
    footerContact: "Contact",
    footerHelp: "Help",
    footerCopy: "© 2026 Ahd. All rights reserved.",
  },
} as const;

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
  const [lang, setLang] = useState<Lang>("uz");
  const t = translations[lang];
  const nav = [
    { href: "#muammo", label: t.navProblem },
    { href: "#qanday", label: t.navHow },
    { href: "#xususiyatlar", label: t.navFeatures },
    { href: "#narxlar", label: t.navPricing },
  ];

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
              {nav.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-[#666] hover:text-[#111]">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label={lang === "uz" ? "Switch to English" : "O'zbekchaga o'tish"}
                onClick={() => setLang((current) => (current === "uz" ? "en" : "uz"))}
                className="inline-flex h-10 items-center rounded-full border border-[#ddd] px-3 text-sm font-semibold text-[#111] hover:border-[#111]"
              >
                {lang === "uz" ? "EN" : "UZ"}
              </button>
              <Link
                href="/register"
                className="hidden h-10 items-center rounded-full bg-[#111] px-5 text-sm font-semibold text-white hover:bg-black lg:inline-flex"
              >
                {t.start}
              </Link>
              <button
                type="button"
                aria-label={t.menu}
                aria-expanded={menu}
                onClick={() => setMenu((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] lg:hidden"
              >
                <span className="sr-only">{t.menu}</span>
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
              {nav.map((item) => (
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
                {t.start}
              </Link>
            </div>
          ) : null}
        </header>

        <section className={`${SHELL} flex flex-col items-center py-12 text-center sm:py-16 md:py-20 lg:py-28`}>
          <h1 className={`${H1} max-w-5xl`}>{t.heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#666] sm:mt-5 md:text-lg lg:text-xl">
            {t.heroLead}
          </p>
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111] px-6 text-[15px] font-semibold text-white hover:bg-black sm:w-auto"
            >
              {t.heroCta}
            </Link>
            <a
              href="#qanday"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#ccc] bg-white px-6 text-[15px] font-semibold text-[#111] hover:border-[#111] sm:w-auto"
            >
              {t.heroSecondary}
            </a>
          </div>
        </section>

        <section id="muammo" className={SECTION}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">{t.whyEyebrow}</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>{t.whyTitle}</h2>
            <p className={LEAD}>{t.whyLead}</p>
            <div className={GRID3}>
              {t.problems.map((item) => (
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
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">{t.howEyebrow}</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>{t.howTitle}</h2>
            <p className={LEAD}>{t.howLead}</p>
            <div className={GRID3}>
              {t.steps.map((step) => (
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
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">{t.featuresEyebrow}</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>{t.featuresTitle}</h2>
            <p className={LEAD}>{t.featuresLead}</p>
            <div className={GRID3}>
              {t.features.map((item) => (
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
            <h2 className={H2}>{t.quotesTitle}</h2>
            <p className={LEAD}>{t.quotesLead}</p>
            <div className={GRID3}>
              {t.quotes.map((item) => (
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
              {t.soonBadge}
            </span>
            <h2 className={`${H2} mt-4`}>{t.soonTitle}</h2>
            <p className={LEAD}>{t.soonLead}</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 lg:gap-6">
              <article className="min-w-0 rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-5 sm:p-6">
                <p className="text-sm text-[#888]">{t.soonLock}</p>
                <h3 className={`${CARD_TITLE} mt-3`}>{t.soonVoiceTitle}</h3>
                <p className={CARD_BODY}>{t.soonVoiceBody}</p>
              </article>
              <article className="min-w-0 rounded-2xl border border-dashed border-[#ccc] bg-[#f5f5f5] p-5 sm:p-6">
                <p className="text-sm text-[#888]">{t.soonLock}</p>
                <h3 className={`${CARD_TITLE} mt-3`}>{t.soonTgTitle}</h3>
                <p className={CARD_BODY}>{t.soonTgBody}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="narxlar" className={SECTION}>
          <div className={SHELL}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#888] uppercase">{t.pricingEyebrow}</p>
            <h2 className={`${H2} mt-3`}>{t.pricingTitle}</h2>
            <p className={LEAD}>{t.pricingLead}</p>
            <div className={GRID3}>
              {t.plans.map((plan) => (
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
                    {t.start}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 sm:pb-16 md:px-8 md:pb-20 lg:px-16">
          <div className="mx-auto max-w-6xl rounded-2xl border border-[#e5e5e5] bg-white px-5 py-12 text-center sm:rounded-3xl sm:px-8 sm:py-16 md:px-12 lg:py-20 xl:max-w-7xl">
            <h2 className={H2}>{t.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#666] md:text-lg">{t.ctaLead}</p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-[#111] px-8 text-[15px] font-semibold text-white hover:bg-black sm:w-auto"
            >
              {t.ctaButton}
            </Link>
            <p className="mt-4 text-sm text-[#999]">{t.ctaNote}</p>
          </div>
        </section>

        <footer className="border-t border-[#e5e5e5] bg-[#f5f5f5]">
          <div className={`${SHELL} py-10 sm:py-12 md:py-14`}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
              <div className="min-w-0">
                <p className="text-lg font-bold">Ahd</p>
                <p className="mt-2 text-sm leading-6 text-[#666]">{t.footerTagline}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">{t.footerProduct}</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="#xususiyatlar" className="text-sm text-[#666] hover:text-[#111]">
                      {t.navFeatures}
                    </a>
                  </li>
                  <li>
                    <a href="#narxlar" className="text-sm text-[#666] hover:text-[#111]">
                      {t.navPricing}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">{t.footerCompany}</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="#qanday" className="text-sm text-[#666] hover:text-[#111]">
                      {t.navHow}
                    </a>
                  </li>
                  <li>
                    <Link href="/login" className="text-sm text-[#666] hover:text-[#111]">
                      {t.footerLogin}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-sm text-[#666] hover:text-[#111]">
                      {t.footerRegister}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#888]">{t.footerSupport}</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="tel:+971566066729" className="text-sm text-[#666] hover:text-[#111]">
                      {t.footerContact}
                    </a>
                  </li>
                  <li>
                    <a href="#narxlar" className="text-sm text-[#666] hover:text-[#111]">
                      {t.footerHelp}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-10 text-sm text-[#999] md:mt-12">{t.footerCopy}</p>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
