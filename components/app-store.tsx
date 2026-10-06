"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  explainError,
  fetchAppData,
  fetchContacts,
  findUserByEmail,
  addContact,
  deleteDealRoom,
  insertDeal,
  insertRating,
  mapMessage,
  personFromSession,
  resendInvitation,
  respondToInvitation,
  saveDealChange,
  type MessageRow,
  type SessionUser,
} from "@/lib/data";
import type { Deal, RatingReview } from "@/lib/deals";
import type { Person } from "@/lib/people";
import { createClient } from "@/lib/supabase";
import { stampLabel } from "@/lib/time-labels";

export type Theme = "light" | "dark";

type NewChatState = { open: boolean; seed: string };

export type ListTab = "deals" | "archive";

/** Which list tab a route implies; routes that say nothing keep the current tab. */
export function tabForPath(pathname: string, archived: string[], current: ListTab): ListTab {
  const chat = pathname.match(/^\/dashboard\/deals\/([^/]+)$/);
  if (chat) return archived.includes(chat[1]) ? "archive" : "deals";
  return current;
}

type AppStore = {
  /** The signed-in user. */
  me: Person;
  /** Sign-in email of the user. */
  email: string;
  /** Other registered users: people you can start a chat with. */
  contacts: Person[];
  refreshContacts: () => Promise<void>;
  searchUserByEmail: (email: string) => Promise<Person | null>;
  addContactById: (userId: string) => Promise<void>;
  /** Last failed database call (shown as a banner); empty when everything is fine. */
  syncError: string;
  dismissSyncError: () => void;
  signOut: () => Promise<void>;
  deals: Deal[];
  unread: Record<string, number>;
  archived: string[];
  theme: Theme;
  /** True once the first load from the database has finished. */
  hydrated: boolean;
  newChat: NewChatState;
  listTab: ListTab;
  setListTab: (tab: ListTab) => void;
  /** True while the mobile chat is sliding out to the right, just before navigating back. */
  closing: boolean;
  /** Navigates back; on mobile the chat slides out to the right first. */
  goBack: (href: string) => void;
  updateDeal: (id: string, updater: (deal: Deal) => Deal, bump?: boolean) => void;
  addDeal: (deal: Deal) => Promise<void>;
  markRead: (id: string) => void;
  toggleArchive: (id: string) => void;
  deleteDeal: (id: string) => Promise<void>;
  setTheme: (theme: Theme) => void;
  openNewChat: (seed?: string) => void;
  closeNewChat: () => void;
  /** Incoming invitations the signed-in user has not answered yet. */
  incomingInvites: Deal[];
  respondToInvite: (invitationId: string, accept: boolean) => Promise<void>;
  resendInvite: (dealId: string, email: string) => Promise<void>;
  reviews: RatingReview[];
  submitRating: (dealId: string, ratedId: string, rating: number, comment: string) => Promise<void>;
};

const AppContext = createContext<AppStore | null>(null);

const archivedKey = (userId: string) => `ahd-archived-${userId}`;

function readArchived(userId: string): string[] {
  try {
    const raw = localStorage.getItem(archivedKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function AppProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const session = useMemo<SessionUser>(
    () => ({ id: user.id, name: user.name, email: user.email, phone: user.phone }),
    [user.id, user.name, user.email, user.phone],
  );
  const [meStats, setMeStats] = useState({ avgRating: null as number | null, totalDeals: 0, totalRatings: 0 });
  const [reviews, setReviews] = useState<RatingReview[]>([]);
  const me = useMemo(() => ({ ...personFromSession(session), ...meStats }), [session, meStats]);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [archived, setArchived] = useState<string[]>([]);
  const [theme, setThemeState] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [newChat, setNewChat] = useState<NewChatState>({ open: false, seed: "" });
  const router = useRouter();
  const pathname = usePathname();
  const [listTab, setListTab] = useState<ListTab>(() => tabForPath(pathname, [], "deals"));
  const [closing, setClosing] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Latest committed lists, so event handlers (and realtime callbacks) never act on stale state.
  const dealsRef = useRef<Deal[]>([]);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const commitDeals = useCallback((next: Deal[]) => {
    dealsRef.current = next;
    setDeals(next);
  }, []);

  /* ---- loading from Supabase ---- */

  const writes = useRef(0); // writes in flight
  const writeVersion = useRef(0); // bumps on every write
  const queue = useRef<Promise<void>>(Promise.resolve());

  const load = useCallback(async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        while (writes.current > 0) await sleep(150);
        const version = writeVersion.current;
        const data = await fetchAppData(supabase, session);
        // A write started while we were reading: this snapshot may miss it, read again.
        if (writeVersion.current !== version && attempt < 2) continue;
        const local = readArchived(session.id);
        const dealIds = new Set(data.deals.map((d) => d.id));
        const merged = data.deals.map((d) => (local.includes(d.id) ? { ...d, archived: true } : d));
        commitDeals(merged);
        setContacts(data.contacts);
        setReviews(data.reviews);
        setMeStats(data.meStats);
        const leftover = local.filter((id) => !dealIds.has(id));
        setArchived(leftover);
        if (leftover.length !== local.length) {
          localStorage.setItem(archivedKey(session.id), JSON.stringify(leftover));
        }
        for (const deal of merged) {
          if (deal.archived && !data.deals.find((d) => d.id === deal.id)?.archived) {
            void supabase.from("deal_rooms").update({ archived: true }).eq("id", deal.id);
          }
        }
        setSyncError("");
        break;
      }
    } catch (error) {
      setSyncError(explainError(error));
    } finally {
      setHydrated(true);
    }
  }, [supabase, session, commitDeals]);

  /** Serializes database writes (a deal must exist before its messages) and heals the UI on failure. */
  const track = useCallback(
    (job: () => Promise<void>) => {
      writes.current += 1;
      writeVersion.current += 1;
      queue.current = queue.current
        .then(job)
        .catch((error: unknown) => {
          setSyncError(explainError(error));
          void load();
        })
        .finally(() => {
          writes.current -= 1;
        });
    },
    [load],
  );

  // Browser storage is unavailable during SSR, so theme and archive are restored after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = localStorage.getItem("ahd-theme");
    if (saved === "dark" || saved === "light") setThemeState(saved);
    setArchived(readArchived(session.id));
  }, [session.id]);

  // Initial load from Supabase: `load` only sets state after its first await (the network round trip).
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ---- realtime: messages, signatures and contributions from other people ---- */

  const refreshTimer = useRef<number | undefined>(undefined);
  const scheduleRefresh = useCallback(() => {
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => void load(), 400);
  }, [load]);

  const bumpUnread = useCallback((id: string) => {
    setUnread((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("ahd-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as MessageRow;
        const list = dealsRef.current;
        const index = list.findIndex((d) => d.id === row.deal_id);
        if (index < 0) {
          scheduleRefresh();
          return;
        }
        const deal = list[index];
        if (deal.messages.some((m) => m.id === row.id)) return; // our own message, already shown
        const message = mapMessage(row, session.id);
        const next: Deal = {
          ...deal,
          messages: [...deal.messages, message],
          updatedAt: stampLabel(new Date(row.created_at)),
        };
        commitDeals([next, ...list.filter((_, i) => i !== index)]);
        if (message.side === "them" && pathRef.current !== `/dashboard/deals/${deal.id}`) bumpUnread(deal.id);
        // Agreement, signature and system messages come with changes to other tables.
        if (row.kind !== "text") scheduleRefresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_rooms" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_participants" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "agreements" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_invitations" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "ratings" }, scheduleRefresh)
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(refreshTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase, session.id, scheduleRefresh, commitDeals, bumpUnread]);

  const updateDeal = useCallback(
    (id: string, updater: (deal: Deal) => Deal, bump = false) => {
      const current = dealsRef.current;
      const index = current.findIndex((d) => d.id === id);
      if (index < 0) return;
      const prev = current[index];
      const next = updater(prev);
      if (next === prev) return;
      commitDeals(bump ? [next, ...current.filter((_, i) => i !== index)] : current.map((d, i) => (i === index ? next : d)));
      track(() => saveDealChange(supabase, session, prev, next));
    },
    [supabase, session, commitDeals, track],
  );

  const addDeal = useCallback(
    async (deal: Deal) => {
      // Keep the row in the list even if the invitation write fails — load() on error used to wipe it.
      commitDeals([deal, ...dealsRef.current.filter((d) => d.id !== deal.id)]);
      writes.current += 1;
      writeVersion.current += 1;
      try {
        console.log("[addDeal] saving", { id: deal.id, status: deal.status, invite: deal.invitation?.email });
        await insertDeal(supabase, session, deal);
        setSyncError("");
      } catch (error) {
        console.error("[addDeal] failed", error);
        setSyncError(explainError(error));
        throw error;
      } finally {
        writes.current -= 1;
      }
    },
    [supabase, session, commitDeals],
  );

  const markRead = useCallback((id: string) => {
    setUnread((current) => (current[id] ? { ...current, [id]: 0 } : current));
  }, []);

  const toggleArchive = useCallback(
    (id: string) => {
      const deal = dealsRef.current.find((d) => d.id === id);
      if (deal) {
        updateDeal(id, (d) => ({ ...d, archived: !d.archived }));
        return;
      }
      setArchived((current) => {
        const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
        localStorage.setItem(archivedKey(session.id), JSON.stringify(next));
        return next;
      });
    },
    [session.id, updateDeal],
  );

  const deleteDeal = useCallback(
    async (id: string) => {
      const deal = dealsRef.current.find((d) => d.id === id);
      if (!deal) return;
      if (deal.createdBy !== session.id) {
        setSyncError("Kelishuvni faqat muallif o'chira oladi.");
        throw new Error("not creator");
      }
      commitDeals(dealsRef.current.filter((d) => d.id !== id));
      try {
        await deleteDealRoom(supabase, session, id);
        setSyncError("");
      } catch (error) {
        setSyncError(explainError(error));
        void load();
        throw error;
      }
      if (pathRef.current === `/dashboard/deals/${id}`) router.push("/dashboard");
    },
    [session, supabase, commitDeals, load, router],
  );

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem("ahd-theme", next);
  }, []);

  const goBack = useCallback(
    (href: string) => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setClosing(true);
        window.setTimeout(() => router.push(href), 240);
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const refreshContacts = useCallback(async () => {
    try {
      setContacts(await fetchContacts(supabase, session));
    } catch {
      // keep the contacts we already have
    }
  }, [supabase, session]);

  const searchUserByEmail = useCallback(
    async (email: string) => findUserByEmail(supabase, email),
    [supabase],
  );

  const addContactById = useCallback(
    async (userId: string) => {
      await addContact(supabase, session.id, userId);
      await refreshContacts();
    },
    [supabase, session.id, refreshContacts],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }, [supabase, router]);

  const dismissSyncError = useCallback(() => setSyncError(""), []);

  const openNewChat = useCallback(
    (seed = "") => {
      setNewChat({ open: true, seed });
      void refreshContacts();
    },
    [refreshContacts],
  );
  const closeNewChat = useCallback(() => setNewChat((current) => ({ ...current, open: false })), []);

  const incomingInvites = useMemo(() => deals.filter((d) => d.incomingInvite), [deals]);
  const archivedIds = useMemo(
    () => [...deals.filter((d) => d.archived).map((d) => d.id), ...archived],
    [deals, archived],
  );

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setListTab(tabForPath(pathname, archivedIds, listTab));
    setClosing(false);
  }

  const respondToInvite = useCallback(
    async (invitationId: string, accept: boolean) => {
      try {
        await respondToInvitation(supabase, invitationId, accept);
        await load();
      } catch (error) {
        setSyncError(explainError(error));
        throw error;
      }
    },
    [supabase, load],
  );

  const resendInvite = useCallback(
    async (dealId: string, email: string) => {
      try {
        await resendInvitation(supabase, dealId, email);
        await load();
      } catch (error) {
        setSyncError(explainError(error));
        throw error;
      }
    },
    [supabase, load],
  );

  const submitRating = useCallback(
    async (dealId: string, ratedId: string, rating: number, comment: string) => {
      await insertRating(supabase, session, { dealId, ratedId, rating, comment });
      commitDeals(dealsRef.current.map((d) => (d.id === dealId ? { ...d, ratedByMe: true } : d)));
      await load();
    },
    [supabase, session, commitDeals, load],
  );

  const value = useMemo<AppStore>(
    () => ({
      me,
      email: session.email,
      contacts,
      refreshContacts,
      searchUserByEmail,
      addContactById,
      syncError,
      dismissSyncError,
      signOut,
      deals,
      unread,
      archived: archivedIds,
      theme,
      hydrated,
      newChat,
      listTab,
      setListTab,
      closing,
      goBack,
      updateDeal,
      addDeal,
      markRead,
      toggleArchive,
      deleteDeal,
      setTheme,
      openNewChat,
      closeNewChat,
      incomingInvites,
      respondToInvite,
      resendInvite,
      reviews,
      submitRating,
    }),
    [
      me,
      session.email,
      contacts,
      refreshContacts,
      searchUserByEmail,
      addContactById,
      syncError,
      dismissSyncError,
      signOut,
      deals,
      unread,
      archivedIds,
      theme,
      hydrated,
      newChat,
      listTab,
      closing,
      goBack,
      updateDeal,
      addDeal,
      markRead,
      toggleArchive,
      deleteDeal,
      setTheme,
      openNewChat,
      closeNewChat,
      incomingInvites,
      respondToInvite,
      resendInvite,
      reviews,
      submitRating,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
