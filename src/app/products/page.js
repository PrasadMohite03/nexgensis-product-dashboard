"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { isAuthenticated, getUser, clearAuth } from "@/utils/auth.utils";
import { parsePage, parseLimit, getTotalPages } from "@/utils/pagination.utils";
import { useProducts } from "@/hooks/useProducts";

import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";

// ─────────────────────────────────────────────────────────────────────────────
// Inner component that uses useSearchParams.
// Must be wrapped in <Suspense> so Next.js can statically render the shell.
// ─────────────────────────────────────────────────────────────────────────────
function ProductsContent({ user, onLogout }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Phase 1: Parse + normalise URL params (synchronous, before any fetch) ──
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { products, total, loading, error, retry } = useProducts({ page, limit });

  // ── Phase 2: Out-of-range page correction (post-fetch, fires once) ──────────
  const hasCorrected = useRef(false);

  useEffect(() => {
    if (loading || !total || hasCorrected.current) return;

    const maxPage = getTotalPages(total, limit);
    if (page > maxPage) {
      hasCorrected.current = true;
      router.replace(`/products?page=${maxPage}&limit=${limit}`);
    }
  }, [loading, total, page, limit, router]);

  // Reset correction lock on each new navigation so it can re-check next time.
  useEffect(() => {
    hasCorrected.current = false;
  }, [page, limit]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalPages = getTotalPages(total, limit);

  // ── Navigation handlers ─────────────────────────────────────────────────────
  function handlePageChange(newPage) {
    router.push(`/products?page=${newPage}&limit=${limit}`);
  }

  function handleLimitChange(newLimit) {
    router.push(`/products?page=1&limit=${newLimit}`);
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse the full product catalogue
          </p>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <svg
              className="w-8 h-8 text-indigo-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-sm text-gray-400">Loading products…</p>
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Something went wrong
              </p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
            <button
              id="retry-btn"
              onClick={retry}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-gray-400"
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
            <p className="text-sm text-gray-500">No products found.</p>
          </div>
        )}

        {/* ── Product list: both views get the same products array ── */}
        {!loading && !error && products.length > 0 && (
          <>
            {/* Desktop table (hidden on mobile via hidden md:block inside component) */}
            <ProductTable products={products} />

            {/* Mobile cards (hidden on desktop via block md:hidden inside component) */}
            <ProductCard products={products} />

            {/* Pagination bar */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 px-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                limit={limit}
                total={total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component — owns auth state and wraps content in Suspense.
// Suspense is required by Next.js whenever useSearchParams is used in a
// "use client" component during static generation.
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
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

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/*
        Suspense boundary required by Next.js App Router for any component
        that calls useSearchParams(). The fallback renders while React
        resolves the client-side search params on first paint.
      */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        }
      >
        <ProductsContent user={user} onLogout={handleLogout} />
      </Suspense>
    </main>
  );
}
