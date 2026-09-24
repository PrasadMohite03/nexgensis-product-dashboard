"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * ProductFormModal Component
 * Modal for creating a new product or editing an existing product.
 * Features a custom searchable category dropdown.
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
    thumbnail: "",
    fileName: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    brand: "",
    rating: "",
  });

  const [errors, setErrors] = useState({});

  // ── Custom Dropdown States ──────────────────────────────────────────────────
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Pre-fill form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isBase64 = (initialData.thumbnail || "").startsWith("data:");
        setFormData({
          title: initialData.title || "",
          thumbnail: initialData.thumbnail || "",
          fileName: isBase64 ? "uploaded-image.png" : "",
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
          thumbnail: "",
          fileName: "",
          description: "",
          category: "",
          price: "",
          stock: "",
          brand: "",
          rating: "",
        });
      }
      setErrors({});
      setIsDropdownOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, initialData]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected category display name
  const selectedCatObj = categories.find((cat) => cat.slug === formData.category);
  const selectedCategoryName = selectedCatObj
    ? selectedCatObj.name
    : formData.category || "";

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
      thumbnail: formData.thumbnail.trim(),
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

  function handleSelectCategory(slug) {
    handleChange("category", slug);
    setIsDropdownOpen(false);
    setSearchQuery("");
  }

  function handleKeyDown(e) {
    if (!isDropdownOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCategories.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCategories.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCategories.length) {
        handleSelectCategory(filteredCategories[highlightedIndex].slug);
      }
    }
  }

  function handleUrlChange(urlValue) {
    setFormData((prev) => ({
      ...prev,
      thumbnail: urlValue,
      fileName: "",
    }));
    if (errors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: null }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: event.target.result,
          fileName: file.name,
        }));
        if (errors.thumbnail) {
          setErrors((prev) => ({ ...prev, thumbnail: null }));
        }
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl shrink-0">
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

          {/* Product Image: Device File Upload & URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Image
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {formData.fileName ? "Change Image" : "Upload from Device"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="hidden"
                  />
                </label>

                <span className="text-xs text-slate-400 font-medium">or</span>

                <input
                  type="url"
                  value={formData.fileName ? "" : formData.thumbnail}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Paste image URL..."
                  disabled={submitting}
                  className="flex-1 min-w-[160px] px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Live Preview & File Info Badge */}
              {formData.thumbnail && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="text-xs min-w-0 pr-1">
                    <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {formData.fileName || "Image Preview"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formData.fileName ? "Uploaded from device" : "Linked via URL"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "", fileName: "" }))}
                    title="Remove image"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Custom Searchable Category Dropdown */}
            <div className="relative z-30" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>

              {/* Closed / Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                onKeyDown={handleKeyDown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Category"
                disabled={submitting}
                className={`w-full px-3 py-2 text-sm text-left bg-slate-50 border rounded-xl outline-none transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  errors.category
                    ? "border-red-500 ring-1 ring-red-200"
                    : isDropdownOpen
                    ? "border-indigo-500 ring-2 ring-indigo-100 bg-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className={formData.category ? "text-slate-900 font-medium capitalize truncate" : "text-slate-400 truncate"}>
                  {selectedCategoryName || "Select Category"}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? "rotate-180 text-indigo-600" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Opened Dropdown Panel */}
              {isDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-64"
                  role="listbox"
                >
                  {/* Search field */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                    <div className="relative">
                      <svg
                        className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setHighlightedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search category..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Options List */}
                  <div className="overflow-y-auto p-1 max-h-48 space-y-0.5 custom-dropdown-scrollbar">
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-400">
                        No categories found
                      </div>
                    ) : (
                      filteredCategories.map((cat, index) => {
                        const isSelected = formData.category === cat.slug;
                        const isHighlighted = highlightedIndex === index;

                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelectCategory(cat.slug)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : isHighlighted
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="capitalize">{cat.name}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

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
              rows="4"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detailed product features and specifications..."
              disabled={submitting}
              className={`w-full min-h-[110px] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl outline-none transition-all resize-y custom-dropdown-scrollbar ${
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
