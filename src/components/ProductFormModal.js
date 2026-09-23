"use client";

import React, { useState, useEffect } from "react";

/**
 * ProductFormModal Component
 * Modal for creating a new product or editing an existing product.
 */
export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  submitting = false,
  apiError = null,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    brand: "",
    rating: "",
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          category: initialData.category || "",
          price: initialData.price !== undefined ? String(initialData.price) : "",
          stock: initialData.stock !== undefined ? String(initialData.stock) : "",
          brand: initialData.brand || "",
          rating: initialData.rating !== undefined ? String(initialData.rating) : "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category: "",
          price: "",
          stock: "",
          brand: "",
          rating: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function validate() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    if (formData.price === "" || isNaN(Number(formData.price))) {
      newErrors.price = "Price is required.";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price must be greater than or equal to 0.";
    }

    if (formData.stock === "" || isNaN(Number(formData.stock))) {
      newErrors.stock = "Stock quantity is required.";
    } else {
      const stockNum = Number(formData.stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        newErrors.stock = "Stock must be a non-negative integer.";
      }
    }

    if (formData.rating !== "" && formData.rating !== null) {
      const ratingNum = Number(formData.rating);
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
        newErrors.rating = "Rating must be between 0 and 5.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate() || submitting) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      brand: formData.brand.trim(),
      rating: formData.rating !== "" ? Number(formData.rating) : 0,
    };

    onSubmit(payload);
  }

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Modal Form Body ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {apiError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Wireless Headphones"
              disabled={submitting}
              className={`w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all ${
                errors.title ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-2 text-sm text-slate-900 bg-slate-50 border rounded-xl outline-none transition-all cursor-pointer ${
                  errors.category ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              >
                <option value="" className="text-slate-900 bg-white">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug} className="text-slate-900 bg-white">
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="e.g. Sony"
                disabled={submitting}
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Price, Stock & Rating */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0.00"
                disabled={submitting}
                className={`w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all ${
                  errors.price ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="10"
                disabled={submitting}
                className={`w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all ${
                  errors.stock ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
              {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
                placeholder="4.5"
                disabled={submitting}
                className={`w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all ${
                  errors.rating ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
              {errors.rating && <p className="text-xs text-red-600 mt-1">{errors.rating}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detailed product features and specifications..."
              disabled={submitting}
              className={`w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all ${
                errors.description ? "border-red-500 ring-1 ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* ── Modal Footer ──────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
