"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { isAuthenticated, getUser, clearAuth } from "@/utils/auth.utils";
import { useProduct } from "@/hooks/useProduct";

import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductSkeleton from "@/components/ProductSkeleton";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [user, setUser] = useState(null);

  // Auth protection check
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

  const { product, loading, error, isNotFound, retry } = useProduct(id);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Products
          </Link>
        </div>

        {/* ── Loading Skeleton ───────────────────────────────────────────── */}
        {loading && <ProductSkeleton />}

        {/* ── 404 / Product Not Found State ───────────────────────────────── */}
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
              The product you are looking for (ID: #{id}) does not exist or has been removed.
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
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Image Gallery Component */}
              <ProductGallery
                images={product.images}
                thumbnail={product.thumbnail}
                title={product.title}
              />

              {/* Right: Product Information */}
              <div className="flex flex-col gap-6">
                {/* Badges & Meta Top */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
                    {product.category}
                  </span>

                  {product.brand && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {product.brand}
                    </span>
                  )}

                  <DetailStockBadge stock={product.stock} />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {product.title}
                </h1>

                {/* Rating Section */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center text-amber-400">
                    <span className="text-base">★</span>
                    <span className="font-bold text-slate-900 ml-1">
                      {product.rating?.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {product.reviews?.length ?? 0} reviews
                  </span>
                </div>

                {/* Pricing Section */}
                <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/60 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${product.price?.toFixed(2)}
                  </span>

                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-slate-400 line-through">
                        $
                        {(
                          product.price /
                          (1 - product.discountPercentage / 100)
                        ).toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                    Description
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Specifications & Commerce Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200">
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
    </main>
  );
}


function DetailStockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Out of stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        Low stock ({stock} left)
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      In stock ({stock} left)
    </span>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-xl">
      <span className="block text-xs font-medium text-slate-400 mb-0.5">
        {label}
      </span>
      <span className="block text-xs font-semibold text-slate-800 truncate">
        {value}
      </span>
    </div>
  );
}
