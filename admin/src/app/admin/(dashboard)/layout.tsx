import { createClient } from "@/lib/supabase/server";
import Sidebar from "./sidebar";
import SignOutButton from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="flex items-center justify-between bg-neutral-950 px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-white text-sm font-black leading-none text-neutral-950">
            T.
          </div>
          <span className="text-xs font-bold tracking-[0.2em]">ADMIN</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-neutral-300">
          <a
            href="https://tratto-smoky.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            ↗ Vedi sito
          </a>
          <span className="text-neutral-500">{user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
