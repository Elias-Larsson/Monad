"use client";

import { AuthForm } from "@/components/forms/auth-form";
import { login } from "@/lib/api";
import type { LoginRequest } from "@/types/login";

function getRedirectPath() {
  const nextPath = new URLSearchParams(window.location.search).get("next");

  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return "/dashboard";
}

export default function LoginPage() {
  async function handleLogin(body: LoginRequest) {
    await login(body);
    window.location.replace(getRedirectPath());
  }

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      submittingLabel="Logging in..."
      errorMessage="Could not log in. Check your email and password."
      footerText="Don't have an account?"
      footerHref="/register"
      footerLinkText="Register"
      passwordAutoComplete="current-password"
      onSubmit={handleLogin}
    />
  );
}
