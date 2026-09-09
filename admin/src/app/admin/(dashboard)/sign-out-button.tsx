"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
    >
      Esci
    </button>
  );
}
