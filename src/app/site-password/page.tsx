"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SitePasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);

    const res = await fetch("/api/site-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Password Required
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        This site is currently private. Enter the password to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default function SitePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense>
        <SitePasswordForm />
      </Suspense>
    </div>
  );
}
