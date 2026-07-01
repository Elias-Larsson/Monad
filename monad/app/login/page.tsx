import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link href="/" className="text-lg font-semibold">
            Monad
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Log in</h1>
        </div>

        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-2 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-2 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-950"
            />
          </label>

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Log in
          </button>
        </form>
      </section>
    </main>
  );
}
