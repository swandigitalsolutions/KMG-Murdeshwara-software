"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";

export default function Sidebar({ isAdmin, companyName }: { isAdmin: boolean; companyName: string }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(
    NAV_ITEMS.find((i) => i.children?.some((c) => pathname.startsWith(c.href)))?.label ?? null
  );

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 min-h-screen flex flex-col print:hidden">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="font-semibold text-lg">Stone Panel</div>
        <div className="text-xs text-slate-400">{companyName}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => {
          if (item.children) {
            const groupActive = item.children.some((c) => pathname.startsWith(c.href));
            const open = openGroup === item.label || groupActive;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    groupActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-3">
                    {item.children.map((child) => {
                      const active = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition ${
                            active
                              ? "bg-slate-700 text-white"
                              : "text-slate-300 hover:bg-slate-800/70"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
