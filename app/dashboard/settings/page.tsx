"use client";

import { useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useApp } from "@/components/app-store";
import { Avatar } from "@/components/avatar";
import { PageFrame } from "@/components/page-frame";

export default function SettingsPage() {
  const { theme, setTheme, me, email, signOut } = useApp();
  const [leaving, setLeaving] = useState(false);

  return (
    <PageFrame title="Sozlamalar" subtitle="Profil va ko'rinish" showBack={false}>
      <div className="flex items-center gap-3">
        <Avatar initials={me.initials} size="xl" />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-ink">{me.name}</p>
          <p className="truncate text-[14px] text-ink2">{email}</p>
        </div>
      </div>

      <dl className="mt-6 border-t border-line">
        <Property label="Ism" value={me.name} />
        <Property label="Email" value={email} />
        <Property label="Til" value="O'zbekcha" />
        <Property label="Imzo" value="Ulangan emas" muted />
      </dl>

      <h2 className="mt-8 text-[13px] font-medium tracking-[0.04em] text-ink2 uppercase">Ko&apos;rinish</h2>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mavzu">
        {(
          [
            { id: "light", label: "Yorug'", icon: <Sun size={16} /> },
            { id: "dark", label: "Qorong'i", icon: <Moon size={16} /> },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={theme === option.id}
            onClick={() => setTheme(option.id)}
            className={`flex h-11 items-center justify-center gap-2 rounded-[10px] border text-[14px] font-medium ${
              theme === option.id ? "border-[#C9A84C] bg-sel text-ink" : "border-line text-ink2 hover:bg-hov"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={leaving}
        onClick={() => {
          setLeaving(true);
          void signOut();
        }}
        className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-line text-[14px] font-medium text-[#C4554D] hover:bg-hov disabled:opacity-50"
      >
        <LogOut size={16} />
        {leaving ? "Chiqilmoqda…" : "Chiqish"}
      </button>
    </PageFrame>
  );
}

function Property({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex min-h-10 items-center gap-3 border-b border-line py-2 text-[14px]">
      <dt className="w-28 shrink-0 text-ink2">{label}</dt>
      <dd className={muted ? "text-ink2" : "text-ink"}>{value}</dd>
    </div>
  );
}
