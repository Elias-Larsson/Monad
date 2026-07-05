"use client";

import Link from "next/link";
import { type SyntheticEvent, useState } from "react";

import type { LoginRequest } from "@/types/login";

type AuthFormProps = {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  errorMessage: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
  passwordAutoComplete: string;
  onSubmit: (body: LoginRequest) => Promise<void>;
};

export function AuthForm({
  title,
  submitLabel,
  submittingLabel,
  errorMessage,
  footerText,
  footerHref,
  footerLinkText,
  passwordAutoComplete,
  onSubmit,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        email: trimmedEmail,
        password,
      });
    } catch {
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1>            
          <Link href="/" className="text-lg text-neutral-700">
            Monad
          </Link>
          </h1>
          <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete={passwordAutoComplete}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-950"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? submittingLabel : submitLabel}
          </button>

          <p className="text-center text-sm text-neutral-500">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-medium text-neutral-950 hover:underline"
            >
              {footerLinkText}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
