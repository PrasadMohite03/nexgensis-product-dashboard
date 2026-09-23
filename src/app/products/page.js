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
import { parseSortBy, parseOrder, parseCategory } from "@/utils/filter.utils";
import { useCategories } from "@/hooks/useCategories";
import FilterBar from "@/components/FilterBar";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: builds a /products URL string from the current nav state.
// Enforces mutual exclusion: URL never contains both category and search.
// ─────────────────────────────────────────────────────────────────────────────
function buildUrl({ page, limit, search, category, sortBy, order }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  // Search and category are mutually exclusive
  if (category) {
    params.set("category", category);
  } else if (search) {
    params.set("search", search);
  }

  if (sortBy) params.set("sortBy", sortBy);
  if (order && sortBy) params.set("order", order);

  return `/products?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — uses useSearchParams, so must be inside <Suspense>.
// ─────────────────────────────────────────────────────────────────────────────
function ProductsContent({ user, onLogout }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Fetch category list once ────────────────────────────────────────────────
  const { categories, loading: categoriesLoading } = useCategories();

  // ── Phase 1: Parse + normalise URL params ──────────────────────────────────
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const search = searchParams.get("search") ?? "";
  const rawCategory = searchParams.get("category") ?? "";
  const category = parseCategory(rawCategory, categories);
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const order = parseOrder(searchParams.get("order"));

  // ── Search input state ──────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState(search);
  const debouncedSearch = useDebounce(inputValue, 400);

  // Sync search input when search param changes in URL
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // When debounced search value changes, push updated URL (clears category)
  useEffect(() => {
    if (debouncedSearch === search) return;
    router.push(
      buildUrl({
        page: 1,
        limit,
        search: debouncedSearch,
        category: "", // Mutual exclusion: typing search clears active category
        sortBy,
        order,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { products, total, loading, error, retry } = useProducts({
    page,
    limit,
    search,
    category,
    sortBy,
    order,
  });

  // ── Phase 2: Out-of-range page correction ──────────────────────────────────
  const hasCorrected = useRef(false);

  useEffect(() => {
    if (loading || !total || hasCorrected.current) return;
    const maxPage = getTotalPages(total, limit);
    if (page > maxPage) {
      hasCorrected.current = true;
      router.replace(
        buildUrl({ page: maxPage, limit, search, category, sortBy, order })
      );
    }
  }, [loading, total, page, limit, search, category, sortBy, order, router]);

  useEffect(() => {
    hasCorrected.current = false;
  }, [page, limit, search, category, sortBy, order]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalPages = getTotalPages(total, limit);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handlePageChange(newPage) {
    router.push(
      buildUrl({ page: newPage, limit, search, category, sortBy, order })
    );
  }

  function handleLimitChange(newLimit) {
    router.push(
      buildUrl({ page: 1, limit: newLimit, search, category, sortBy, order })
    );
  }

  function handleCategoryChange(newCategory) {
    // Mutual exclusion: selecting category clears active search
    setInputValue("");
    router.push(
      buildUrl({
        page: 1,
        limit,
        search: "",
        category: newCategory,
        sortBy,
        order,
      })
    );
  }

  function handleSortChange(newSortBy, newOrder) {
    router.push(
      buildUrl({
        page: 1,
        limit,
        search,
        category,
        sortBy: newSortBy,
        order: newOrder,
      })
    );
  }

  function handleClearSearch() {
    setInputValue("");
    router.push(
      buildUrl({ page: 1, limit, search: "", category: "", sortBy, order })
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse and filter the full product catalogue
          </p>
        </div>

        {/* ── Filter Bar (Search + Category + Sort) ── */}
        <FilterBar
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onClearSearch={handleClearSearch}
          category={category}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />

        {/* Active filter label feedback */}
        {(search || category) && (
          <div className="mb-4 text-sm text-slate-500">
            {search && (
              <span>
                Search results for{" "}
                <span className="font-semibold text-indigo-600">&ldquo;{search}&rdquo;</span>
              </span>
            )}
            {category && (
              <span>
                Showing category{" "}
                <span className="font-semibold text-indigo-600">&ldquo;{category}&rdquo;</span>
              </span>
            )}
          </div>
        )}

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
              {category
                ? `No products found in category "${category}".`
                : search
                ? `No products found for "${search}".`
                : "No products found."}
            </p>
          </div>
        )}

        {/* ── Product list ── */}
        {!loading && !error && products.length > 0 && (
          <>
            <ProductTable products={products} />
            <ProductCard products={products} />
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
