"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setError("Email o password non corrette.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signIn(email, password);
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-8">
      <header className="mx-auto mb-8 flex max-w-5xl items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center bg-white text-sm font-black leading-none text-neutral-950">
          T.
        </div>
        <span className="h-6 w-px bg-neutral-700" />
        <span className="text-xs font-semibold tracking-[0.2em] text-neutral-400">
          PANNELLO AMMINISTRATIVO
        </span>
      </header>

      <div className="mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-neutral-50 p-8 sm:p-10"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.15em] text-red-600">
            AREA RISERVATA · TRATTO
          </p>
          <h1 className="mb-3 text-3xl font-bold text-neutral-950">Accedi</h1>
          <p className="mb-8 text-sm leading-relaxed text-neutral-500">
            Inserisci le credenziali per gestire ospiti e contenuti.
          </p>

          <label className="mb-2 block text-xs font-semibold tracking-[0.1em] text-neutral-600">
            EMAIL
          </label>
          <input
            type="email"
            required
            placeholder="tuo@email.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-5 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />

          <label className="mb-2 block text-xs font-semibold tracking-[0.1em] text-neutral-600">
            PASSWORD
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />

          <label className="mb-6 flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Resta connesso
          </label>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-950 px-4 py-3 text-sm font-bold tracking-[0.1em] text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "ACCESSO IN CORSO…" : "ACCEDI"}
          </button>

          <hr className="my-6 border-neutral-200" />

          <a
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← Torna al sito pubblico
          </a>
        </form>
      </div>
    </div>
  );
}
