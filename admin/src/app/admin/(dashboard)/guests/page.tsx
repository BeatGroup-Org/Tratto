import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GuestsManager from "./guests-manager";

export const metadata: Metadata = {
  title: "Ospiti",
};

export default async function GuestsPage() {
  const supabase = await createClient();
  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Ospiti</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Persone collegate al portfolio e ai progetti.
        </p>
      </div>
      <GuestsManager initialGuests={guests ?? []} />
    </div>
  );
}
