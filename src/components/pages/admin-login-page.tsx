"use client";

import { AdminAuthProvider } from "@/context/admin-auth-provider";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen items-center justify-center bg-[var(--ploy-background-secondary)] px-6 py-16">
        <AdminLoginForm />
      </div>
    </AdminAuthProvider>
  );
}
