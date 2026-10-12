import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/");
  return (
    <main className="login">
      <div className="login__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="" width={44} height={41} />
        <h1>Blue Square Dashboard</h1>
        <p className="muted">Sign in to your company dashboard.</p>
        <LoginForm />
      </div>
    </main>
  );
}
