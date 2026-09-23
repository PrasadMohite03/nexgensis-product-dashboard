"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { isAuthenticated, getUser, clearAuth } from "@/utils/auth.utils";
import { parsePage, parseLimit, getTotalPages } from "@/utils/pagination.utils";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";

import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: builds a /products URL string from the current nav state.
// Omits `search` when empty so the URL stays clean.
// ─────────────────────────────────────────────────────────────────────────────
function buildUrl({ page, limit, search }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  return `/products?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — uses useSearchParams, so must be inside <Suspense>.
// ─────────────────────────────────────────────────────────────────────────────
function ProductsContent({ user, onLogout }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Phase 1: Parse + normalise URL params (synchronous, before any fetch) ──
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const search = searchParams.get("search") ?? ""; // raw string, "" means no search

  // ── Search input state ──────────────────────────────────────────────────────
  // `inputValue` is what the user sees in the text box (updates on every keystroke).
  // `debouncedSearch` lags 400ms behind — this is what gets written to the URL.
  const [inputValue, setInputValue] = useState(search);
  const debouncedSearch = useDebounce(inputValue, 400);

  // Keep the input box in sync when the URL changes externally
  // (e.g. browser back/forward, or the page reloads with ?search=phone).
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // When the debounced value settles and differs from the current URL param,
  // push a new URL. Always reset to page 1 on a new search.
  useEffect(() => {
    if (debouncedSearch === search) return; // already in sync — nothing to do
    router.push(buildUrl({ page: 1, limit, search: debouncedSearch }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);
  // ↑ Intentionally omitting `search`, `limit`, `page`, `router` from deps.
  //   This effect should ONLY fire when the debounced value changes — not when
  //   the URL updates as a result of it (which would cause a loop).

  // ── Data fetching ───────────────────────────────────────────────────────────
  // useProducts handles AbortController + stale-flag race protection internally.
  const { products, total, loading, error, retry } = useProducts({
    page,
    limit,
    search,
  });

  // ── Phase 2: Out-of-range page correction (post-fetch, fires once) ──────────
  const hasCorrected = useRef(false);

  useEffect(() => {
    if (loading || !total || hasCorrected.current) return;
    const maxPage = getTotalPages(total, limit);
    if (page > maxPage) {
      hasCorrected.current = true;
      router.replace(buildUrl({ page: maxPage, limit, search }));
    }
  }, [loading, total, page, limit, search, router]);

  useEffect(() => {
    hasCorrected.current = false;
  }, [page, limit, search]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalPages = getTotalPages(total, limit);

  // ── Navigation handlers — preserve search param ─────────────────────────────
  function handlePageChange(newPage) {
    router.push(buildUrl({ page: newPage, limit, search }));
  }

  function handleLimitChange(newLimit) {
    router.push(buildUrl({ page: 1, limit: newLimit, search }));
  }

  // ── Clear search ─────────────────────────────────────────────────────────────
  function handleClearSearch() {
    setInputValue("");
    // Navigate immediately without waiting for debounce.
    router.push(buildUrl({ page: 1, limit, search: "" }));
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

        {/* ── Search input ── */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            {/* Search icon */}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>

            <input
              id="search-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            {/* Clear button — only shown when input has content */}
            {inputValue && (
              <button
                id="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Active search label */}
          {search && (
            <p className="mt-2 text-sm text-gray-500">
              Results for{" "}
              <span className="font-medium text-indigo-600">&ldquo;{search}&rdquo;</span>
            </p>
          )}
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
            <p className="text-sm text-gray-500">
              {search
                ? `No products found for "${search}".`
                : "No products found."}
            </p>
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
// Page component — owns auth state and wraps ProductsContent in <Suspense>.
// Required by Next.js App Router when useSearchParams() is used in a
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
