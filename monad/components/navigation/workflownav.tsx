"use client"
export const WorkflowNav = () => {
  
  const navItems = ["Overview", "Workflows", "Runs", "Settings"];

  return (
    <aside className="hidden lg:block">
      <nav aria-label="Sidebar navigation" className="space-y-1">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className="block rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-white hover:text-neutral-950"
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  )
}
