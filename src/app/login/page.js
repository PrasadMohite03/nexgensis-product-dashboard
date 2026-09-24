"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAuthenticated } from "@/utils/auth.utils";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, skip to products.
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/products");
    }
  }, [router]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await login(form);
  }

  function handleFillDemo() {
    setForm({ username: "emilys", password: "emilyspass" });
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* ── Left Column: Full-Bleed Illustration & Direct Branding Overlay ── */}
      <div className="relative lg:w-5/12 xl:w-1/2 min-h-[360px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-slate-200/80 overflow-hidden shrink-0 flex flex-col justify-between p-6 sm:p-8 lg:pt-8 lg:pb-6 lg:px-10">
        {/* Full-bleed illustration filling left column, cropped from left to highlight girl & full dashboard table */}
        <img
          src="/login-illustration.png"
          alt="Nexgensis Product Management Dashboard Illustration"
          className="absolute inset-0 w-full h-full object-cover object-[38%_center] pointer-events-none"
        />

        {/* 1. Top-Left Branding Header (Shifted slightly to the left) */}
        <div className="relative z-10 flex items-center gap-2.5 -ml-2 sm:-ml-3 lg:-ml-4">
          <img
            src="/logo.png"
            alt="Nexgensis Logo"
            className="h-6 sm:h-7 w-auto object-contain shrink-0"
          />
          <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
            Nexgensis Dashboard
          </span>
        </div>

        {/* 2. Bottom-Left Copyright Footer (left: 40px, bottom: 24px) */}
        <div className="relative z-10 text-xs text-slate-600 hidden lg:block font-semibold tracking-wide">
          © {new Date().getFullYear()} Nexgensis Product Dashboard. All rights reserved.
        </div>
      </div>

      {/* ── Right Column: Modern Login Card ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm sm:shadow-md p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Sign in to your Nexgensis Dashboard
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/80 p-3.5"
              >
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. emilys"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] disabled:bg-slate-100 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] disabled:bg-slate-100 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.017 10.017 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-4.225-4.225L3 3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#4F46E5] hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Demo Credentials</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  Fill demo login
                </button>
              </div>
              <div className="w-full flex items-center justify-between text-xs text-slate-700 font-mono bg-white px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs">
                <span><strong className="text-slate-500 font-sans font-normal">Username:</strong> emilys</span>
                <span className="text-slate-300">|</span>
                <span><strong className="text-slate-500 font-sans font-normal">Password:</strong> emilyspass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

