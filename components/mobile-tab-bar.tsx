"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { MessageCircle, User, UsersRound } from "lucide-react";
import { useApp, type ListTab } from "@/components/app-store";

type Item = {
  id: "deals" | "contacts" | "profile";
  label: string;
  href: string;
  icon: ReactNode;
  badge: number;
};

/** Bottom tab bar, mobile only: Kelishuvlar | Kontaktlar | Profil. */
export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { deals, unread, archived, setListTab, goBack } = useApp();

  const onProfile = pathname.startsWith("/dashboard/settings");
  const onContacts = pathname.startsWith("/dashboard/contacts");
  const active: Item["id"] = onProfile ? "profile" : onContacts ? "contacts" : "deals";

  const count = (ids: string[]) => ids.reduce((sum, id) => sum + (archived.includes(id) ? 0 : (unread[id] ?? 0)), 0);

  const items: Item[] = [
    {
      id: "deals",
      label: "Kelishuvlar",
      href: "/dashboard",
      icon: <MessageCircle size={24} />,
      badge: count(deals.map((d) => d.id)),
    },
    {
      id: "contacts",
      label: "Kontaktlar",
      href: "/dashboard/contacts",
      icon: <UsersRound size={24} />,
      badge: 0,
    },
    { id: "profile", label: "Profil", href: "/dashboard/settings", icon: <User size={24} />, badge: 0 },
  ];

  function open(event: React.MouseEvent, item: Item) {
    if (item.id === "profile" || item.id === "contacts") return;
    event.preventDefault();
    const tab: ListTab = "deals";
    setListTab(tab);
    if (onProfile || onContacts) goBack(item.href);
    else if (pathname !== item.href) router.push(item.href);
  }

  return (
    <nav
      aria-label="Asosiy"
      className="z-20 grid shrink-0 grid-cols-3 border-t border-line bg-panel md:hidden"
      style={{ height: "calc(60px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const on = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={(event) => open(event, item)}
            aria-current={on ? "page" : undefined}
            className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] ${
              on ? "font-semibold text-ink" : "text-ink2"
            }`}
          >
            <span className="relative">
              {item.icon}
              {item.badge > 0 ? (
                <span className="absolute -top-1 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-badge px-1 text-[10px] font-semibold text-badgeink">
                  {item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
