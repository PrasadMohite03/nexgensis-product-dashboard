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
import { useProductMutations } from "@/hooks/useProductMutations";
import { useProductMutationContext } from "@/context/ProductMutationContext";
import FilterBar from "@/components/FilterBar";
import ProductFormModal from "@/components/ProductFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

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

  // ── Mutations hook ──────────────────────────────────────────────────────────
  const {
    submitting,
    error: mutationError,
    setError: setMutationError,
    createProduct: apiCreateProduct,
    updateProduct: apiUpdateProduct,
    deleteProduct: apiDeleteProduct,
  } = useProductMutations();

  // ── Shared mutation overlay (via context — also consumed by /products/[id]) ──
  const {
    createdProducts,
    updatedProductsMap,
    deletedProductIds,
    addCreatedProduct,
    addUpdatedProduct,
    addDeletedProduct,
  } = useProductMutationContext();

  // Modal dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

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
  const { products: fetchedProducts, total: fetchedTotal, loading, error, retry } = useProducts({
    page,
    limit,
    search,
    category,
    sortBy,
    order,
  });

  // ── Compute visible products with mutation overlays ──────────────────────────
  // Rules:
  //   1. Created/edited products are filtered by the active category and search.
  //   2. Updated products that no longer match the active filter are removed.
  //   3. Created products only appear on page 1 (server has no awareness of them).
  //   4. Combined list is re-sorted by the active sortBy/order.
  //   5. Total count is computed from filter-eligible items only.
  const { displayProducts, total } = (() => {
    const trimmedSearch   = (search   ?? "").trim().toLowerCase();
    const trimmedCategory = (category ?? "").trim().toLowerCase();

    /** Returns true if the product passes the active category + search filters. */
    function matchesFilters(p) {
      if (trimmedCategory) {
        if ((p.category ?? "").trim().toLowerCase() !== trimmedCategory) return false;
      }
      if (trimmedSearch) {
        const inTitle = (p.title       ?? "").toLowerCase().includes(trimmedSearch);
        const inDesc  = (p.description ?? "").toLowerCase().includes(trimmedSearch);
        if (!inTitle && !inDesc) return false;
      }
      return true;
    }

    /** Returns a new sorted array by sortBy/order (does not mutate). */
    function sortItems(arr) {
      if (!sortBy) return arr;
      return [...arr].sort((a, b) => {
        let av = a[sortBy] ?? "";
        let bv = b[sortBy] ?? "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return order === "desc" ? 1 : -1;
        if (av > bv) return order === "desc" ? -1 : 1;
        return 0;
      });
    }

    // Track which IDs are local-only (not server-fetched) for total calculation.
    const createdIds = new Set(createdProducts.map((p) => p.id));

    // 1. Server-fetched products: apply edits, remove deleted, remove if edit
    //    moved them outside the active filter (e.g. category changed to other).
    const mergedFetched = (fetchedProducts ?? [])
      .filter((p) => !deletedProductIds.has(p.id))
      .map((p) => (updatedProductsMap[p.id] ? { ...p, ...updatedProductsMap[p.id] } : p))
      .filter(matchesFilters);

    // 2. Locally-created products: apply any subsequent edits, remove deleted,
    //    filter by active category/search.
    const eligibleCreated = createdProducts
      .filter((p) => !deletedProductIds.has(p.id))
      .map((p) => (updatedProductsMap[p.id] ? { ...p, ...updatedProductsMap[p.id] } : p))
      .filter(matchesFilters);

    // 3. Only show created products on page 1 — they are virtual and have no
    //    server-assigned position in deeper pages.
    const visibleCreated = page === 1 ? eligibleCreated : [];

    // 4. Combine and re-sort the current page's visible set.
    const dp = sortItems([...visibleCreated, ...mergedFetched]);

    // 5. Adjusted total:
    //    - fetchedTotal already reflects the active search/category from the server.
    //    - Add filter-eligible created products (server is unaware of them).
    //    - Subtract deleted products that came from the server (not local creates).
    //    - Subtract server-fetched products whose local edit moved them OUT of the
    //      active filter (they were counted by the server but are now hidden).
    const deletedFromFetchedCount = [...deletedProductIds].filter(
      (id) => !createdIds.has(id)
    ).length;

    const editedOutOfFilterCount = (fetchedProducts ?? [])
      .filter((p) => !deletedProductIds.has(p.id) && updatedProductsMap[p.id])
      .map((p) => ({ ...p, ...updatedProductsMap[p.id] }))
      .filter((p) => !matchesFilters(p)).length;

    const t =
      fetchedTotal +
      eligibleCreated.length -
      deletedFromFetchedCount -
      editedOutOfFilterCount;

    return { displayProducts: dp, total: t };
  })();

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

  // ── CRUD Handlers ───────────────────────────────────────────────────────────
  function handleOpenAdd() {
    setEditingProduct(null);
    setMutationError(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setMutationError(null);
    setIsFormOpen(true);
  }

  function handleOpenDelete(product) {
    setDeletingProduct(product);
    setMutationError(null);
    setIsDeleteOpen(true);
  }

  async function handleFormSubmit(payload) {
    if (editingProduct) {
      // EDIT MODE
      // Check whether this is a locally-created product (exists only in context).
      // If so, skip the DummyJSON PUT — it has no record of this ID.
      const isLocalProduct = createdProducts.some(
        (p) => String(p.id) === String(editingProduct.id)
      );

      if (isLocalProduct) {
        // Write directly to context — no API call.
        addUpdatedProduct(editingProduct.id, { ...editingProduct, ...payload });
        setIsFormOpen(false);
        return;
      }

      // Existing API product: call DummyJSON PUT, then persist overlay.
      const res = await apiUpdateProduct(editingProduct.id, payload);
      if (res) {
        addUpdatedProduct(editingProduct.id, { ...editingProduct, ...payload, ...res });
        setIsFormOpen(false);
      }
    } else {
      // ADD MODE
      const res = await apiCreateProduct(payload);
      if (res) {
        const newProd = {
          id: res.id || Date.now(),
          thumbnail: "https://placehold.co/150x150?text=New+Product",
          images: ["https://placehold.co/600x600?text=New+Product"],
          rating: 0,
          reviews: [],
          ...payload,
          ...res,
        };
        // Persist into shared context so /products/[id] can render it
        addCreatedProduct(newProd);
        setIsFormOpen(false);
      }
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return;

    // Check whether this is a locally-created product (exists only in context).
    // If so, skip the DummyJSON DELETE — it has no record of this ID.
    const isLocalProduct = createdProducts.some(
      (p) => String(p.id) === String(deletingProduct.id)
    );

    if (isLocalProduct) {
      // Write directly to context — no API call.
      addDeletedProduct(deletingProduct.id);
      setIsDeleteOpen(false);
      return;
    }

    // Existing API product: call DummyJSON DELETE, then persist overlay.
    const res = await apiDeleteProduct(deletingProduct.id);
    if (res) {
      addDeletedProduct(deletingProduct.id);
      setIsDeleteOpen(false);
    }
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page heading & Add Product Action */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse, filter, and manage your product catalogue
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
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
        {!loading && !error && displayProducts.length === 0 && (
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
        {!loading && !error && displayProducts.length > 0 && (
          <>
            <ProductTable
              products={displayProducts}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
            <ProductCard
              products={displayProducts}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
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

      {/* ── Add/Edit Product Modal ────────────────────────────────────── */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
        submitting={submitting}
        apiError={mutationError}
      />

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        productTitle={deletingProduct?.title}
        submitting={submitting}
        apiError={mutationError}
      />
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
