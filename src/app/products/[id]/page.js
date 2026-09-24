"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { isAuthenticated, getUser, clearAuth } from "@/utils/auth.utils";
import { useProduct } from "@/hooks/useProduct";
import { useCategories } from "@/hooks/useCategories";
import { useProductMutations } from "@/hooks/useProductMutations";
import { useProductMutationContext } from "@/context/ProductMutationContext";
import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductSkeleton from "@/components/ProductSkeleton";
import ProductReviews from "@/components/ProductReviews";
import ProductFormModal from "@/components/ProductFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  // DummyJSON IDs are numeric; locally-created ones may be numeric strings
  // from Date.now(). Normalize to a string for map/set lookups.
  const id = rawId != null ? String(rawId) : null;

  const [user, setUser] = useState(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { categories } = useCategories();
  const {
    submitting,
    error: mutationError,
    setError: setMutationError,
    updateProduct: apiUpdateProduct,
    deleteProduct: apiDeleteProduct,
  } = useProductMutations();

  // ── Shared mutation overlay ─────────────────────────────────────────────────
  // This is the same state that /products reads, so edits/deletes made on the
  // list page are immediately visible here, and vice versa.
  const {
    createdProducts,
    updatedProductsMap,
    deletedProductIds,
    addUpdatedProduct,
    addDeletedProduct,
  } = useProductMutationContext();

  // Auth protection
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

  // ── Resolve the product from context or API ─────────────────────────────────
  // Step 1: Check if this is a locally-created product.
  //         IDs in createdProducts may be numbers (from res.id) or Date.now()
  //         strings; compare as strings for safety.
  const locallyCreated = createdProducts.find(
    (p) => String(p.id) === id
  ) ?? null;

  // Step 2: If it's locally created, skip the API call entirely.
  //         If it's an API product, fetch it normally.
  const shouldFetchFromApi = !locallyCreated;

  const {
    product: fetchedProduct,
    loading: fetchLoading,
    error: fetchError,
    isNotFound: fetchIsNotFound,
    retry,
  } = useProduct(shouldFetchFromApi ? id : null);

  // ── Derive the displayed product ────────────────────────────────────────────
  // Priority: locallyCreated base → merged with any local update
  //           API product base   → merged with any local update
  const baseProduct = locallyCreated ?? fetchedProduct;
  const localUpdate = id ? updatedProductsMap[id] ?? updatedProductsMap[Number(id)] : null;
  const product = baseProduct
    ? localUpdate
      ? { ...baseProduct, ...localUpdate }
      : baseProduct
    : null;

  // ── Derived loading / error / not-found states ──────────────────────────────
  // For locally-created products: never loading, never a fetch error.
  const loading  = locallyCreated ? false : fetchLoading;
  const error    = locallyCreated ? null  : fetchError;
  const isNotFound =
    deletedProductIds.has(id) ||
    deletedProductIds.has(Number(id)) ||
    (locallyCreated ? false : fetchIsNotFound);

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleEditSubmit(payload) {
    if (locallyCreated) {
      // Locally-created product exists only in context — DummyJSON has no
      // record of it, so skip the API entirely and update the context directly.
      addUpdatedProduct(id, { ...product, ...payload });
      setIsEditOpen(false);
      return;
    }

    // Existing API product: call DummyJSON PUT, then persist to context.
    const res = await apiUpdateProduct(id, payload);
    if (res) {
      addUpdatedProduct(id, { ...product, ...payload, ...res });
      setIsEditOpen(false);
    }
  }

  async function handleDeleteConfirm() {
    if (locallyCreated) {
      // Locally-created product exists only in context — skip the API and
      // mark it deleted directly in context so it disappears from both pages.
      addDeletedProduct(id);
      setIsDeleteOpen(false);
      router.push("/products");
      return;
    }

    // Existing API product: call DummyJSON DELETE, then record in context.
    const res = await apiDeleteProduct(id);
    if (res) {
      addDeletedProduct(id);
      setIsDeleteOpen(false);
      router.push("/products");
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Breadcrumb + Actions Bar ──────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            <Link
              href="/products"
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              Products
            </Link>
            {product?.category && (
              <>
                <span className="text-slate-300">/</span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-slate-500 hover:text-indigo-600 transition-colors font-medium capitalize"
                >
                  {product.category}
                </Link>
              </>
            )}
            {product?.title && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium truncate max-w-[180px] sm:max-w-xs">
                  {product.title}
                </span>
              </>
            )}
          </nav>

          {/* Action buttons */}
          {!loading && !isNotFound && !error && product && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setMutationError(null); setIsEditOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-slate-300 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              <button
                type="button"
                onClick={() => { setMutationError(null); setIsDeleteOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#DC2626] bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>


        {/* ── Loading Skeleton ───────────────────────────────────────────── */}
        {loading && <ProductSkeleton />}

        {/* ── Locally deleted / 404 / Product Not Found ────────────────────── */}
        {!loading && isNotFound && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              The product you are looking for (ID: #{rawId}) does not exist or has been removed.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Return to Catalog
            </Link>
          </div>
        )}

        {/* ── Generic API Error State ──────────────────────────────────────── */}
        {!loading && !isNotFound && error && (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md mx-auto shadow-sm my-12">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Error Loading Product
            </h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={retry}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Product Details Display ─────────────────────────────────────── */}
        {!loading && !isNotFound && !error && product && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Image Gallery Component */}
              <ProductGallery
                images={product.images}
                thumbnail={product.thumbnail}
                title={product.title}
              />

              {/* Right: Product Information */}
              <div className="flex flex-col gap-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/products?category=${encodeURIComponent(product.category)}`}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border border-indigo-100 capitalize transition-colors"
                  >
                    {product.category}
                  </Link>
                  {product.brand && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
                      {product.brand}
                    </span>
                  )}
                  <DetailStockBadge stock={product.stock} />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight tracking-tight">
                  {product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-base ${s <= Math.round(product.rating || 0) ? "text-amber-400" : "text-slate-200"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{product.rating?.toFixed(1) ?? "—"}</span>
                  <span className="text-sm text-[#64748B]">{product.reviews?.length ?? 0} reviews</span>
                </div>

                {/* Pricing */}
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-[#0F172A] tabular-nums">
                    ${product.price?.toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-base text-[#94A3B8] line-through tabular-nums">
                        ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] text-xs font-bold border border-emerald-100">
                        {product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">
                    Description
                  </h3>
                  <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Spec cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-[#E2E8F0]">
                  <SpecItem label="SKU" value={product.sku || "N/A"} />
                  <SpecItem label="Warranty" value={product.warrantyInformation || "Standard"} />
                  <SpecItem label="Shipping" value={product.shippingInformation || "Available"} />
                  <SpecItem label="Return Policy" value={product.returnPolicy || "Standard"} />
                  <SpecItem label="Min Order" value={product.minimumOrderQuantity ? `${product.minimumOrderQuantity} units` : "1 unit"} />
                  <SpecItem label="Availability" value={product.availabilityStatus || "In Stock"} />
                </div>
              </div>
            </div>

            {/* ── Product Reviews Section ─────────────────────────────────── */}
            <ProductReviews reviews={product.reviews} />
          </div>
        )}
      </div>

      {/* ── Edit Product Modal ────────────────────────────────────── */}
      <ProductFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={product}
        categories={categories}
        submitting={submitting}
        apiError={mutationError}
      />

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        productTitle={product?.title}
        submitting={submitting}
        apiError={mutationError}
      />
    </main>
  );
}



function DetailStockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#DC2626] border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] inline-block" />
        Out of stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#D97706] border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] inline-block" />
        Low stock ({stock} left)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
      In stock ({stock} left)
    </span>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl hover:border-slate-300 transition-colors">
      <span className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1">
        {label}
      </span>
      <span className="block text-xs font-semibold text-[#0F172A] truncate">
        {value}
      </span>
    </div>
  );
}
