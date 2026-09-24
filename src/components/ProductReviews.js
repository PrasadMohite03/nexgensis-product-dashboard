"use client";

import React from "react";

/**
 * ProductReviews Component
 * Displays product reviews with reviewer name, rating stars, date, and comments.
 * Data and logic are unchanged — only visual presentation improved.
 */
export default function ProductReviews({ reviews = [] }) {
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  return (
    <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F1F5F9]">
        <h2 className="text-lg font-bold text-[#0F172A]">Customer Reviews</h2>
        {hasReviews && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
            {reviews.length}
          </span>
        )}
      </div>

      {!hasReviews ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#E2E8F0]">
            <svg className="w-6 h-6 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <p className="text-[#94A3B8] text-sm">No reviews yet for this product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review, index) => {
            const formattedDate = review.date
              ? new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;

            const initial = review.reviewerName
              ? review.reviewerName.charAt(0).toUpperCase()
              : "U";

            return (
              <div
                key={`${review.reviewerName}-${index}`}
                className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col gap-3 hover:border-slate-300 transition-colors"
              >
                {/* Header: Avatar + Name + Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0 select-none">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] text-sm truncate">
                        {review.reviewerName || "Anonymous Customer"}
                      </p>
                      {formattedDate && (
                        <p className="text-[11px] text-[#94A3B8]">{formattedDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Numeric rating badge */}
                  <span className="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shrink-0">
                    {review.rating}/5
                  </span>
                </div>

                {/* Star row */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= (review.rating || 0) ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-[#64748B] text-sm leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
