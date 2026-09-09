import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ count: guestsCount }, { count: unreadCount }] = await Promise.all([
    supabase.from("guests").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/guests"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-400"
        >
          <p className="text-sm text-neutral-500">Ospiti</p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">{guestsCount ?? 0}</p>
        </Link>
        <Link
          href="/admin/messages"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-400"
        >
          <p className="text-sm text-neutral-500">Messaggi non letti</p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">{unreadCount ?? 0}</p>
        </Link>
      </div>
    </div>
  );
}
