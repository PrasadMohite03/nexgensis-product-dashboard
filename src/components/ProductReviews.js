"use client";

import React from "react";

/**
 * ProductReviews Component
 * Displays product reviews with reviewer name, rating stars, date, and comments.
 */
export default function ProductReviews({ reviews = [] }) {
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Customer Reviews
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            {hasReviews ? reviews.length : 0}
          </span>
        </h2>
      </div>

      {!hasReviews ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">No reviews yet for this product.</p>
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
                className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  {/* Top Header: Avatar, Name & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {initial}
                      </div>
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {review.reviewerName || "Anonymous Customer"}
                      </span>
                    </div>

                    {formattedDate && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= (review.rating || 0) ? "★" : "☆"}
                      </span>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-1">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-slate-700 text-sm leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
