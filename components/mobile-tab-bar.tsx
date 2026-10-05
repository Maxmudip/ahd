"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { MessageCircle, User, Users } from "lucide-react";
import { useApp, type ListTab } from "@/components/app-store";

type Item = {
  id: "deals" | "pools" | "profile";
  label: string;
  href: string;
  icon: ReactNode;
  badge: number;
};

/** Bottom tab bar, mobile only: Kelishuvlar | Pool Qarz | Profil. */
export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { deals, pools, unread, archived, listTab, setListTab, goBack } = useApp();

  const onProfile = pathname.startsWith("/dashboard/settings");
  const active: Item["id"] = onProfile ? "profile" : listTab === "pools" ? "pools" : "deals";

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
      id: "pools",
      label: "Pool Qarz",
      href: "/dashboard/pool-qarz",
      icon: <Users size={24} />,
      badge: count(pools.map((p) => p.id)),
    },
    { id: "profile", label: "Profil", href: "/dashboard/settings", icon: <User size={24} />, badge: 0 },
  ];

  function open(event: React.MouseEvent, item: Item) {
    if (item.id === "profile") return; // plain link: the profile screen slides in
    event.preventDefault();
    const tab: ListTab = item.id === "pools" ? "pools" : "deals";
    setListTab(tab);
    if (onProfile) goBack(item.href);
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
