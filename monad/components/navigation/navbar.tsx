import Link from "next/link";

export const NavBar = () => {
  const navItems = ["Workflows", "Account"];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold">
          Monad
        </Link>
        <nav aria-label="Primary navigation" className="hidden gap-1 sm:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
