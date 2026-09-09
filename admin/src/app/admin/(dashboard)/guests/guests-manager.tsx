"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Guest = {
  id: string;
  name: string;
  role: string | null;
  nationality: string | null;
  slug: string | null;
  bio_short: string | null;
  bio: string | null;
  photo_url: string | null;
  section: string | null;
  sort_order: number;
  featured: boolean;
};

const emptyForm = {
  name: "",
  role: "",
  nationality: "",
  slug: "",
  bio_short: "",
  bio: "",
  photo_url: "",
  section: "",
  featured: true,
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function GuestsManager({ initialGuests }: { initialGuests: Guest[] }) {
  const supabase = createClient();
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) =>
      [g.name, g.role, g.section].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [guests, search]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(guest: Guest) {
    setEditingId(guest.id);
    setForm({
      name: guest.name,
      role: guest.role ?? "",
      nationality: guest.nationality ?? "",
      slug: guest.slug ?? "",
      bio_short: guest.bio_short ?? "",
      bio: guest.bio ?? "",
      photo_url: guest.photo_url ?? "",
      section: guest.section ?? "",
      featured: guest.featured,
    });
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      nationality: form.nationality.trim().toUpperCase() || null,
      slug: form.slug.trim() || slugify(form.name),
      bio_short: form.bio_short.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      section: form.section.trim() || null,
      featured: form.featured,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("guests")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      setGuests((prev) => prev.map((g) => (g.id === editingId ? (data as Guest) : g)));
    } else {
      const { data, error } = await supabase
        .from("guests")
        .insert(payload)
        .select()
        .single();
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      setGuests((prev) => [data as Guest, ...prev]);
    }

    setSaving(false);
    closeModal();
  }

  async function toggleFeatured(guest: Guest) {
    const { data, error } = await supabase
      .from("guests")
      .update({ featured: !guest.featured })
      .eq("id", guest.id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setGuests((prev) => prev.map((g) => (g.id === guest.id ? (data as Guest) : g)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo ospite?")) return;
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome, ruolo, sezione…"
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900 sm:w-80"
        />
        <button
          onClick={openNew}
          className="shrink-0 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Nuovo ospite
        </button>
      </div>

      {error && !modalOpen && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3 font-semibold">Foto</th>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Ruolo</th>
              <th className="px-4 py-3 font-semibold">Naz.</th>
              <th className="px-4 py-3 font-semibold">Sezione</th>
              <th className="px-4 py-3 text-center font-semibold">In evidenza</th>
              <th className="px-4 py-3 text-right font-semibold">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                  {guests.length === 0 ? "Nessun ospite ancora." : "Nessun risultato."}
                </td>
              </tr>
            )}
            {filtered.map((guest) => (
              <tr
                key={guest.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  {guest.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guest.photo_url}
                      alt={guest.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                      {initials(guest.name)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{guest.name}</p>
                  <p className="text-xs text-neutral-400">{guest.slug || slugify(guest.name)}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">{guest.role || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{guest.nationality || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{guest.section || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleFeatured(guest)}
                    title={guest.featured ? "In evidenza sul sito" : "Nascosto dal sito"}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      guest.featured
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 text-neutral-300"
                    }`}
                  >
                    ★
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(guest)}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium hover:bg-neutral-100"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingId ? "Modifica ospite" : "Nuovo ospite"}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-700"
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Nome e cognome
                </label>
                <input
                  placeholder="Nome e cognome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Ruolo
                </label>
                <input
                  placeholder="Es. regista, attore, docente"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Es. regista, attore, docente, musicista.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Nazionalità
                </label>
                <input
                  placeholder="IT"
                  maxLength={2}
                  value={form.nationality}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nationality: e.target.value.toUpperCase() }))
                  }
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase outline-none focus:border-neutral-900"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Codice ISO 2-lettere (es. IT, FR, US).
                </p>
              </div>

              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">Slug</label>
                <input
                  placeholder="mario-rossi"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
                <p className="mt-1 text-xs text-neutral-500">Lascia vuoto per generarlo dal nome.</p>
              </div>

              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Sezione del festival
                </label>
                <input
                  placeholder="Sezione del festival"
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  URL foto
                </label>
                <input
                  placeholder="URL foto"
                  value={form.photo_url}
                  onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Bio breve
                </label>
                <textarea
                  placeholder="Una riga di presentazione"
                  value={form.bio_short}
                  onChange={(e) => setForm((f) => ({ ...f, bio_short: e.target.value }))}
                  rows={2}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="col-span-full">
                <label className="mb-1 block text-sm font-semibold text-neutral-900">
                  Bio completa
                </label>
                <textarea
                  placeholder="Biografia completa"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="col-span-full">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  In evidenza sul sito pubblico
                </label>
              </div>

              {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

              <div className="col-span-full mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving ? "Salvataggio…" : editingId ? "Salva modifiche" : "Aggiungi ospite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
