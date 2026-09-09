"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Panoramica",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Contenuti",
    items: [{ href: "/admin/guests", label: "Ospiti" }],
  },
  {
    label: "Comunicazione",
    items: [{ href: "/admin/messages", label: "Messaggi" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 px-4 py-6">
      <nav className="space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
