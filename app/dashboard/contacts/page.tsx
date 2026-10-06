"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AddContactSheet } from "@/components/add-contact";
import { Avatar } from "@/components/avatar";
import { useApp } from "@/components/app-store";
import { PageFrame } from "@/components/page-frame";
import { initialsOf } from "@/lib/chat-helpers";
import { RatingBadge } from "@/components/deal-close";

export default function ContactsPage() {
  const { contacts } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <PageFrame title="Kontaktlar" subtitle="Kelishuv boshlash uchun odamlar" back="/dashboard">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-btn text-[14px] font-semibold text-btnink hover:opacity-85"
        >
          <UserPlus size={16} />
          Kontakt qo'shish
        </button>

        {contacts.length === 0 ? (
          <p className="mt-6 text-[14px] leading-6 text-ink2">
            Hali kontakt yo&apos;q. Email orqali odam qo'shing — keyin u bilan chat ochishingiz mumkin.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {contacts.map((person) => (
              <li key={person.id} className="flex items-center gap-3 py-3">
                <Avatar initials={initialsOf(person.name)} size="xl" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[15px] font-medium text-ink">
                    {person.name}
                    <RatingBadge rating={person.avgRating} />
                  </p>
                  <p className="truncate text-[13px] text-ink2">{person.email || person.phone}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageFrame>
      <AddContactSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
