"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useApp } from "@/components/app-store";
import { Sheet } from "@/components/sheet";
import { explainError } from "@/lib/data";
import { initialsOf } from "@/lib/chat-helpers";
import type { Person } from "@/lib/pool-qarz";

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddContactSheet({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: (person: Person) => void;
}) {
  const { me, email: myEmail, contacts, searchUserByEmail, addContactById } = useApp();
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<Person | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"search" | "add" | null>(null);

  function reset() {
    setEmail("");
    setFound(null);
    setError("");
    setBusy(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function search() {
    const needle = email.trim().toLowerCase();
    setError("");
    setFound(null);
    if (!EMAIL_OK.test(needle)) {
      setError("To'g'ri email kiriting.");
      return;
    }
    if (needle === myEmail.toLowerCase() || needle === me.email?.toLowerCase()) {
      setError("O'zingizni kontaktga qo'sha olmaysiz.");
      return;
    }
    setBusy("search");
    try {
      const person = await searchUserByEmail(needle);
      if (!person) {
        setError("Bu email bilan foydalanuvchi topilmadi.");
        return;
      }
      if (contacts.some((c) => c.id === person.id)) {
        setError("Bu odam allaqachon kontaktlaringizda.");
        setFound(person);
        return;
      }
      setFound(person);
    } catch (err) {
      setError(explainError(err));
    } finally {
      setBusy(null);
    }
  }

  async function add() {
    if (!found || busy) return;
    if (contacts.some((c) => c.id === found.id)) {
      setError("Bu odam allaqachon kontaktlaringizda.");
      return;
    }
    setBusy("add");
    setError("");
    try {
      await addContactById(found.id);
      onAdded?.(found);
      close();
    } catch (err) {
      setError(explainError(err));
      setBusy(null);
    }
  }

  const already = found ? contacts.some((c) => c.id === found.id) : false;

  return (
    <Sheet open={open} title="Kontakt qo'shish" onClose={close}>
      <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="text-[17px] font-semibold text-ink">Kontakt qo'shish</p>
        <p className="mt-1 text-[13.5px] leading-5 text-ink2">
          Ro&apos;yxatdan o&apos;tgan foydalanuvchining emailini yozing.
        </p>
        <label className="mt-4 block">
          <span className="text-[12px] font-medium text-ink2">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFound(null);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void search();
              }
            }}
            placeholder="email@example.com"
            autoComplete="email"
            className="field mt-1"
          />
        </label>
        <button
          type="button"
          onClick={() => void search()}
          disabled={busy !== null}
          className="mt-3 h-11 w-full rounded-[10px] border border-line text-[14px] font-medium text-ink hover:bg-hov disabled:opacity-40"
        >
          {busy === "search" ? "Qidirilmoqda…" : "Qidirish"}
        </button>
        {found ? (
          <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-wash px-3 py-3">
            <Avatar initials={initialsOf(found.name)} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink">{found.name}</p>
              <p className="truncate text-[13px] text-ink2">{found.email}</p>
            </div>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-[13px] text-[#C4554D]">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void add()}
          disabled={!found || already || busy !== null}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-btn text-[14px] font-semibold text-btnink hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UserPlus size={16} />
          {busy === "add" ? "Qo'shilmoqda…" : "Qo'shish"}
        </button>
      </div>
    </Sheet>
  );
}
