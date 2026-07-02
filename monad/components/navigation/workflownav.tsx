"use client"

import Link from "next/link";

export const WorkflowNav = () => {
  
  const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Workflows", href: "/workflows" },
    { label: "Runs", href: "/runs" },
    { label: "Account", href: "/account" },
    { label: "Home", href: "/" },
  ];
  return (
    <aside className="hidden lg:block">
      <nav aria-label="Sidebar navigation" className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-white hover:text-neutral-950"
          >
            {item.label}Link
          </Link>
        ))}
      </nav>
    </aside>
  )
}
