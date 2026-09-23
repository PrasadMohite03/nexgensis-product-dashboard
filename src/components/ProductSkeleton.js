"use client";

import React from "react";

/**
 * Skeleton loader for product details page.
 */
export default function ProductSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* ── Left Column: Gallery Skeleton ────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full bg-slate-200 rounded-2xl" />
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-slate-200 rounded-xl" />
          <div className="w-20 h-20 bg-slate-200 rounded-xl" />
          <div className="w-20 h-20 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* ── Right Column: Content Skeleton ───────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
        </div>

        <div className="h-9 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-6 w-1/3 bg-slate-200 rounded-md" />

        <div className="h-10 w-40 bg-slate-200 rounded-xl" />

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="h-4 w-4/6 bg-slate-200 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="h-16 bg-slate-200 rounded-xl" />
          <div className="h-16 bg-slate-200 rounded-xl" />
          <div className="h-16 bg-slate-200 rounded-xl" />
          <div className="h-16 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
