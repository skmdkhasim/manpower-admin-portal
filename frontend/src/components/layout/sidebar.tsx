"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasPermission, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-ink-950 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 font-display text-base font-semibold text-white">
          M
        </div>
        <span
          className="font-mono text-xs font-medium tracking-wide text-white"
          style={{ letterSpacing: "0.6px" }}
        >
          MANPOWERERP
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map(
          (item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative block rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors",
                  "hover:bg-white/5 hover:text-white",
                  active && "bg-white/10 text-white",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-blue-500" />
                )}
                {item.label}
              </Link>
            );
          },
        )}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-white/10 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
          {user ? initials(user.fullName) : "?"}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-white">
            {user?.fullName ?? "—"}
          </span>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="text-[13px] text-white/50 hover:text-white/80 hover:underline"
          >
            Log out
          </button>
        </span>
      </div>
    </aside>
  );
}
