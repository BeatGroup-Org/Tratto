"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesManager({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  async function toggleRead(msg: Message) {
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ is_read: !msg.is_read })
      .eq("id", msg.id)
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? (data as Message) : m)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo messaggio?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-400">
            <th className="px-4 py-3 font-semibold">Mittente</th>
            <th className="px-4 py-3 font-semibold">Messaggio</th>
            <th className="px-4 py-3 font-semibold">Data</th>
            <th className="px-4 py-3 font-semibold">Stato</th>
            <th className="px-4 py-3 text-right font-semibold">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                Nessun messaggio ricevuto.
              </td>
            </tr>
          )}
          {messages.map((msg) => (
            <tr
              key={msg.id}
              className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 ${
                msg.is_read ? "" : "bg-amber-50/60"
              }`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-neutral-900">{msg.name}</p>
                <p className="text-xs text-neutral-400">{msg.email}</p>
              </td>
              <td className="max-w-xs px-4 py-3 text-neutral-600">
                <p className="line-clamp-2">{msg.message}</p>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {new Date(msg.created_at).toLocaleString("it-IT")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    msg.is_read
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {msg.is_read ? "Letto" : "Non letto"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggleRead(msg)}
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium hover:bg-neutral-100"
                  >
                    {msg.is_read ? "Segna non letto" : "Segna letto"}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Elimina
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
