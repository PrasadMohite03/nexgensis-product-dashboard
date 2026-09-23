"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, clearAuth } from "@/utils/auth.utils";

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Guard: redirect unauthenticated users to login.
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  // Avoid flash of content before the auth check resolves.
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            Nexgensis Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </span>
          </span>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body placeholder */}
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Authentication successful. The product dashboard will be built in the
          next step.
        </p>
      </div>
    </main>
  );
}
