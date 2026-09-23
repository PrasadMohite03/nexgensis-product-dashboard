"use client";

import React from "react";

/**
 * DeleteConfirmModal Component
 * Renders confirmation dialog before deleting a product.
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle = "this product",
  submitting = false,
  apiError = null,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete <strong className="text-slate-800">&ldquo;{productTitle}&rdquo;</strong>? This action cannot be undone.
        </p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
            {apiError}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
