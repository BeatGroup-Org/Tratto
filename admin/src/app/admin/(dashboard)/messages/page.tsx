import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MessagesManager from "./messages-manager";

export const metadata: Metadata = {
  title: "Messaggi",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Messaggi</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Messaggi ricevuti dal modulo di contatto del sito.
        </p>
      </div>
      <MessagesManager initialMessages={messages ?? []} />
    </div>
  );
}
