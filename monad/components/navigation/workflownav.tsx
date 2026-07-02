"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const WorkflowNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Workflows", href: "/workflows" },
    { label: "Runs", href: "/runs" },
  ];
  return (
    <aside className="hidden lg:block">
      <nav aria-label="Sidebar navigation" className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-neutral-100 font-medium text-neutral-950"
                  : "text-neutral-600 hover:bg-white hover:text-neutral-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
