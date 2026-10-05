import { Fragment } from "react";
import Link from "next/link";
import { Check, MessageSquare, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/button";
import { LandingHeader } from "@/components/landing-header";
import { Logo } from "@/components/logo";

const features = [
  {
    title: "Chatdan kelishuv",
    body: "Oddiy suhbat rasmiy bandlarga aylanadi. Tomonlar, muddat va summa o'z joyida qoladi.",
    points: ["Jonli muhokama", "Avtomatik bandlar", "Bitta xona"],
    mock: <ChatMock />,
  },
  {
    title: "AI tahlil",
    body: "Ahd suhbatni o'qiydi va shartnoma qoralamasini yozadi. Siz faqat tekshirasiz va imzolaysiz.",
    points: ["Tuzilgan bo'limlar", "O'zbekcha matn", "Bir zumda qoralama"],
    mock: <AgreementMock />,
  },
  {
    title: "Pool Qarz",
    body: "Do'stlar bir maqsadga pul yig'adi. Progress, muddat va qaytarish jadvali ochiq turadi.",
    points: ["Umumiy yig'ish", "Ishtirokchilar", "Qaytarish grafigi"],
    mock: <PoolMock />,
  },
];

const steps = [
  {
    n: "01",
    title: "Chat",
    body: "Deal room oching. Shartlarni oddiy tilda yozing.",
    icon: MessageSquare,
  },
  {
    n: "02",
    title: "AI tahlil",
    body: "Ahd suhbatni tuzilgan shartnomaga aylantiradi.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Imzolang",
    body: "Har ikki tomon raqamli imzo qo'yadi. PDF saqlanadi.",
    icon: PenLine,
  },
];

const plans = [
  {
    name: "Free",
    price: "0 so'm",
    period: "",
    blurb: "3 ta kelishuv / oy",
    features: ["3 ta kelishuv oyiga", "1 foydalanuvchi", "PDF eksport", "Pool Qarz asosiy"],
    recommended: false,
  },
  {
    name: "Pro",
    price: "49,000",
    period: "so'm/oy",
    blurb: "Cheksiz kelishuv",
    features: ["Cheksiz kelishuv", "AI tahlil", "Raqamli imzo", "Prioritet yordam"],
    recommended: true,
  },
  {
    name: "Business",
    price: "149,000",
    period: "so'm/oy",
    blurb: "Jamoa uchun",
    features: ["Jamoa workspace", "Cheksiz a'zolar", "Umumiy hujjatlar", "Admin boshqaruvi"],
    recommended: false,
  },
];

const footer = {
  Mahsulot: [
    { label: "Kelishuvlar", href: "#imkoniyatlar" },
    { label: "Pool Qarz", href: "#imkoniyatlar" },
    { label: "AI tahlil", href: "#imkoniyatlar" },
    { label: "Narxlar", href: "#narxlar" },
  ],
  Kompaniya: [
    { label: "Biz haqimizda", href: "#qanday" },
    { label: "Qanday ishlaydi", href: "#qanday" },
    { label: "Kirish", href: "/login" },
  ],
  Aloqa: [
    { label: "muhammad@ahd.uz", href: "mailto:muhammad@ahd.uz" },
    { label: "Toshkent", href: "#narxlar" },
    { label: "Ro'yxatdan o'tish", href: "/register" },
  ],
};

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-white text-[#37352F]">
      <LandingHeader />

      <main>
        <section className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF9F7_100%)] px-6 pt-32 pb-16 text-center">
          <div className="mx-auto inline-flex rounded-full bg-[#F5F4F0] px-3 py-1 text-[13px] text-[#787774]">
            O&apos;zbekiston uchun <span className="ml-1 text-[#C9A84C]">#1</span>
            <span className="ml-1">kelishuv platformasi</span>
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-[40px] leading-[1.08] font-extrabold tracking-[-0.04em] text-[#111] sm:text-[68px]">
            <span className="block">Tanish interfeys,</span>
            <span className="mt-1 block">
              <span className="text-[#C9A84C]">kuchli</span> himoya
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-8 text-[#787774] sm:text-[20px]">
            Kelishuvlarni xabar yozgandek oson tuzing. Ahd suhbatni shartnomaga aylantiradi — siz esa raqamli imzo
            bilan tasdiqlaysiz.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/register">Bepul boshlash</Button>
            <Button href="#mahsulot" variant="outline">
              Demo ko&apos;rish
            </Button>
          </div>
          <p className="mt-4 text-[13px] text-[#ACABA8]">Kredit kartasi shart emas • Bepul plan bor</p>

          <div id="mahsulot" className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-[16px] border border-[#E9E9E7] bg-white text-left shadow-[0_32px_80px_rgba(17,17,17,0.12)]">
              <AppMockup />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F4F0] px-6 py-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex -space-x-2">
              {["MK", "JA", "DR", "BT", "NU"].map((initials) => (
                <span
                  key={initials}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F5F4F0] bg-[#EBE8E1] text-[11px] font-medium text-[#37352F]"
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-[14px] text-[#37352F]">1,200+ foydalanuvchi ishonadi</p>
          </div>
        </section>

        <section id="imkoniyatlar" className="scroll-mt-16 px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-[36px] font-bold tracking-[-0.03em] text-[#111] sm:text-[48px]">
              Hamma narsangiz bir joyda
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px] text-[#787774]">
              Muhokama, hujjat va umumiy yordam — alohida ilovalarsiz.
            </p>
          </div>
          <div className="mx-auto mt-20 flex max-w-5xl flex-col gap-24">
            {features.map((feature, index) => (
              <article key={feature.title} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>{feature.mock}</div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <h3 className="text-[30px] font-semibold tracking-[-0.02em] text-[#111]">{feature.title}</h3>
                  <p className="mt-3 text-[16px] leading-7 text-[#787774]">{feature.body}</p>
                  <ul className="mt-6 space-y-2">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-[15px] text-[#37352F]">
                        <Check size={16} className="text-[#C9A84C]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="qanday" className="scroll-mt-16 bg-[#111] px-6 py-24 text-white">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center text-[36px] font-bold tracking-[-0.03em] sm:text-[48px]">Qanday ishlaydi</h2>
            <div className="mt-16 flex flex-col gap-4 md:flex-row md:items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Fragment key={step.n}>
                    <article
                      className="min-w-0 flex-1 rounded-[16px] border border-[#2A2A2A] bg-[#1C1C1C] px-8 py-10"
                      style={{ borderColor: "#2A2A2A" }}
                    >
                      <span className="inline-flex rounded-full bg-[#C9A84C] px-2.5 py-0.5 text-[13px] font-bold text-[#111]">
                        {step.n}
                      </span>
                      <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2A2A2A]">
                        <Icon size={48} strokeWidth={1.5} className="text-white" />
                      </div>
                      <h3 className="mt-6 text-[20px] font-bold">{step.title}</h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-[#999]">{step.body}</p>
                    </article>
                    {index < steps.length - 1 ? (
                      <span className="hidden shrink-0 text-[22px] leading-none text-[#C9A84C] md:block" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </Fragment>
                );
              })}
            </div>
            <div className="mt-14 text-center">
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-[6px] bg-[#C9A84C] px-5 text-[14px] font-semibold text-[#111] transition-colors duration-100 hover:bg-[#B3943E]"
              >
                Hoziroq boshlang
              </Link>
            </div>
          </div>
        </section>

        <section id="narxlar" className="scroll-mt-16 border-t border-[#E7E4DC] px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-[36px] font-bold tracking-[-0.03em] text-[#111] sm:text-[48px]">Oddiy narxlar</h2>
            <p className="mt-3 text-[16px] text-[#787774]">Yashirin to&apos;lov yo&apos;q. Istalgan vaqt to&apos;xtatish mumkin.</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-[4px] border bg-white p-6 ${
                  plan.recommended
                    ? "border-[#C9A84C] shadow-[0_12px_40px_rgba(201,168,76,0.12)]"
                    : "border-[#E7E4DC]"
                }`}
              >
                <p className="text-[14px] text-[#787774]">{plan.name}</p>
                <p className="mt-3 text-[32px] font-bold tracking-[-0.03em] text-[#111]">
                  {plan.price}{" "}
                  {plan.period ? <span className="text-[16px] font-medium text-[#787774]">{plan.period}</span> : null}
                </p>
                <p className="mt-2 text-[14px] text-[#787774]">{plan.blurb}</p>
                <ul className="mt-6 flex-1 space-y-2">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] text-[#37352F]">
                      <Check size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button href="/register" variant={plan.recommended ? "primary" : "secondary"} className="mt-8">
                  Boshlash
                </Button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E7E4DC] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-[220px] text-[14px] leading-6 text-[#787774]">
              So&apos;zingiz hujjat bo&apos;lsin. Chat, AI va raqamli imzo bir joyda.
            </p>
          </div>
          {Object.entries(footer).map(([title, items]) => (
            <div key={title}>
              <p className="text-[14px] font-medium text-[#111]">{title}</p>
              <ul className="mt-3 md:space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith("/") ? (
                      <Link href={item.href} className="inline-flex min-h-11 items-center break-anywhere text-[14px] text-[#787774] hover:text-[#111] md:min-h-0">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="inline-flex min-h-11 items-center break-anywhere text-[14px] text-[#787774] hover:text-[#111] md:min-h-0">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E7E4DC]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-[13px] text-[#ACABA8] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Ahd</p>
            <p>O&apos;zbekiston 🇺🇿</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppMockup() {
  const chats = [
    { i: "NP", name: "Ofis ijarasi — Toshkent", time: "14:22", prev: "Qabul. Kommunal alohida.", unread: 1, active: true },
    { i: "DC", name: "IT xizmatlari shartnomasi", time: "Kecha", prev: "✍️ Imzolash kutilmoqda", unread: 2 },
    { i: "JA", name: "Jasur — Tibbiy xarajat", time: "2 soat", prev: "Bobur 400 000 so'm qo'shdi ✓", unread: 3 },
    { i: "AB", name: "Hamkorlik memorandumi", time: "12-sent", prev: "✓✓ Yakunlangan", unread: 0, done: true },
  ];
  return (
    <div className="flex h-[440px] sm:h-[460px]">
      <aside className="hidden w-[280px] shrink-0 border-r border-[#E9E9E7] bg-white sm:flex sm:flex-col">
        <div className="flex h-[52px] items-center justify-between border-b border-[#E9E9E7] px-4">
          <Logo href="/" />
          <span className="text-[16px] text-[#667781]">✎</span>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex h-8 items-center rounded-full bg-[#F0F2F5] px-3.5 text-[12px] text-[#667781]">
            Qidirish yoki yangi boshlash
          </div>
          <div className="mt-2 flex gap-1.5 text-[11.5px] font-medium">
            <span className="rounded-full bg-[#111] px-2.5 py-1 text-white">Kelishuvlar</span>
            <span className="rounded-full bg-[#F0F2F5] px-2.5 py-1 text-[#667781]">Pool Qarz</span>
            <span className="rounded-full bg-[#F0F2F5] px-2.5 py-1 text-[#667781]">Arxiv</span>
          </div>
        </div>
        <div className="flex-1">
          {chats.map((chat) => (
            <div key={chat.name} className={`flex h-[64px] items-center gap-2.5 px-3 ${chat.active ? "bg-[#F0F2F5]" : ""}`}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EADFC2] text-[13px] font-semibold text-[#6B5520]">
                {chat.i}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-[#111]">{chat.name}</span>
                  <span className="shrink-0 text-[11px] text-[#667781]">{chat.time}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className={`truncate text-[12px] ${chat.done ? "text-[#2E9E5B]" : "text-[#667781]"}`}>{chat.prev}</span>
                  {chat.unread ? (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#111] px-1 text-[10.5px] font-semibold text-white">
                      {chat.unread}
                    </span>
                  ) : null}
                </span>
              </span>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#F0F2F5]">
        <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E9E9E7] bg-white px-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EADFC2] text-[12px] font-semibold text-[#6B5520]">
            NP
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold text-[#111]">Ofis ijarasi — Toshkent</span>
            <span className="block truncate text-[11.5px] text-[#667781]">Navoiy Plaza MChJ</span>
          </span>
          <span className="hidden rounded-full bg-[#F0F2F5] px-2 py-0.5 text-[11px] font-medium text-[#111] md:block">Kelishuv</span>
          <span className="rounded-[3px] bg-[#F6E6D8] px-1.5 py-0.5 text-[11px] font-medium text-[#8F5430]">Imzolash</span>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden px-4 py-3">
          <div className="flex justify-center">
            <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-medium text-[#667781] shadow-sm">Bugun</span>
          </div>
          <div className="flex w-full justify-start">
            <div className="mr-auto max-w-[80%] rounded-[0_12px_12px_12px] border border-[#E9E9E7] bg-white px-2.5 pt-1.5 pb-1 md:max-w-[65%]">
              <p className="text-[11.5px] font-semibold text-[#8A6B2E]">Navoiy Plaza</p>
              <p className="text-[13px] leading-[1.4] text-[#111]">Ijara 6 oy, oylik 8 mln so&apos;m. Kafolat — 1 oy.</p>
              <p className="mt-0.5 text-right text-[10.5px] text-[#667781]">14:20</p>
            </div>
          </div>
          <div className="flex w-full justify-end">
            <div className="ml-auto max-w-[80%] rounded-[12px_0_12px_12px] bg-[#111] md:max-w-[65%] px-2.5 pt-1.5 pb-1">
              <p className="text-[13px] leading-[1.4] text-white">Qabul. Kommunal alohida to&apos;lanadi.</p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] text-white/60">
                14:22 <span className="text-[#C9A84C]">✓✓</span>
              </p>
            </div>
          </div>
          <div className="flex w-full justify-start">
            <div className="mr-auto w-full max-w-[300px] rounded-[0_12px_12px_12px] border border-l-4 border-[#E9E9E7] border-l-[#C9A84C] bg-white px-3 py-2">
              <p className="text-[13px] font-semibold text-[#111]">📄 Kelishuv tayyorlandi</p>
              <p className="mt-1 line-clamp-2 rounded-[6px] bg-[#F0F2F5] px-2 py-1.5 text-[11.5px] leading-4 text-[#667781]">
                <span className="font-semibold text-[#111]">1. Tomonlar.</span> Ijaraga beruvchi va ijarachi 6 oy muddatga...
              </p>
              <div className="mt-2 flex gap-1.5 text-[12px] font-medium">
                <span className="flex-1 rounded-[8px] border border-[#E9E9E7] py-1.5 text-center text-[#111]">Ko&apos;rish</span>
                <span className="flex-1 rounded-[8px] bg-[#111] py-1.5 text-center text-white">Imzolash</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[52px] shrink-0 items-center gap-2 border-t border-[#E9E9E7] bg-white px-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[18px] text-[#667781]">+</span>
          <span className="flex h-8 flex-1 items-center rounded-full bg-[#F0F2F5] px-3.5 text-[12.5px] text-[#667781]">Xabar yozing...</span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-[14px] text-white">→</span>
        </div>
      </div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-[#E7E4DC] bg-white shadow-[0_12px_40px_rgba(17,17,17,0.06)]">
      <div className="border-b border-[#E7E4DC] px-4 py-3 text-[14px] font-medium">Muhokama</div>
      <div className="space-y-4 px-4 py-4">
        <Comment name="Siz" text="Ijara 6 oy, oylik 8 mln so'm. Kafolat — 1 oy." />
        <Comment name="Navoiy Plaza" text="Qabul. Kommunal alohida. Imzo bugun." />
      </div>
      <div className="border-t border-[#E7E4DC] bg-[#F5F4F0] px-4 py-4">
        <p className="text-[12px] tracking-[0.04em] text-[#ACABA8] uppercase">Hujjat</p>
        <p className="mt-1 text-[16px] font-semibold text-[#111]">Ofis ijarasi — Toshkent</p>
        <p className="mt-1 text-[13px] text-[#787774]">3 band tayyor · Imzo kutilmoqda</p>
      </div>
    </div>
  );
}

function Comment({ name, text }: { name: string; text: string }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-[#37352F]">{name}</p>
      <p className="mt-0.5 text-[14px] leading-6 text-[#37352F]">{text}</p>
    </div>
  );
}

function AgreementMock() {
  return (
    <div className="rounded-[6px] border border-[#E7E4DC] bg-white p-5 shadow-[0_12px_40px_rgba(17,17,17,0.06)]">
      <div className="space-y-2 border-b border-[#E7E4DC] pb-3 text-[13px]">
        <p>
          <span className="inline-block w-24 text-[#787774]">Holat</span>
          <span className="rounded-[3px] bg-[#F6E6D8] px-1.5 py-0.5 text-[12px] font-medium text-[#8F5430]">Imzolash</span>
        </p>
        <p>
          <span className="inline-block w-24 text-[#787774]">Ishtirokchi</span>
          <span className="rounded-[3px] bg-[#F6EFD9] px-1 text-[13px] font-medium text-[#8A6B2E]">@Muhammad</span>
        </p>
      </div>
      <h3 className="mt-4 text-[24px] font-semibold text-[#111]">IT xizmatlari</h3>
      <p className="mt-2 text-[14px] leading-6 text-[#37352F]">
        Ijrochi MVP dasturini 6 hafta ichida topshiradi. Qiymat 42 000 AQSh dollari, ikki qismda.
      </p>
      <div className="mt-4 rounded-[4px] bg-[#F5F4F0] p-3 text-[13px] text-[#37352F]">✍️ Imzo kutilmoqda — Digital Craft</div>
    </div>
  );
}

function PoolMock() {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[#E7E4DC] bg-white shadow-[0_12px_40px_rgba(17,17,17,0.06)]">
      <div className="flex h-24 items-center justify-center bg-[#F5F4F0]">
        <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#111]">2 000 000 so&apos;m</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[14px] font-semibold text-[#37352F]">Jasur Aliyev</p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-[3px] bg-[#FDEBEC] px-1.5 py-0.5 text-[12px] font-medium text-[#C4554D]">Tibbiy xarajat</span>
          <span className="rounded-[3px] bg-[#F6EFD9] px-1.5 py-0.5 text-[12px] font-medium text-[#8A6B2E]">Yig&apos;ilmoqda</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#EBE8E1]">
          <div className="h-full w-[62%] bg-[#C9A84C]" />
        </div>
        <p className="mt-2 text-[13px] text-[#787774]">👤 3 kishi • ⏱ 5 kun</p>
      </div>
    </div>
  );
}
