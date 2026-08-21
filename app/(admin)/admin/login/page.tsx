import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-6 py-16">
      <p className="label text-accent-ink">UDKING&rsquo;S</p>
      <h1 className="display mt-2 text-3xl">Shop admin</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter the passcode to manage the catalogue and orders.
      </p>
      <LoginForm />
    </div>
  );
}
