"use client";

import { AuthForm } from "@/components/forms/auth-form";
import { login, register } from "@/lib/api";
import type { LoginRequest } from "@/types/login";

export default function RegisterPage() {
  async function handleRegister(body: LoginRequest) {
    const res = await register(body);

    await login({
      email: res.email,
      password: body.password,
    });

    window.location.replace("/dashboard");
  }

  return (
    <AuthForm
      title="Register"
      submitLabel="Register"
      submittingLabel="Registering..."
      errorMessage="Could not register. Try another email or check your password."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Log in"
      passwordAutoComplete="new-password"
      onSubmit={handleRegister}
    />
  );
}
