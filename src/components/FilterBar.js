"use client";

import React from "react";

/**
 * FilterBar Component
 * Combines Search input, Category selector dropdown, and Sort selector dropdown.
 */
export function FilterBar({
  inputValue,
  onInputChange,
  onClearSearch,
  category,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  categories = [],
  categoriesLoading = false,
}) {
  const currentSortKey = sortBy ? `${sortBy}:${order}` : "";

  function handleSortSelect(e) {
    const val = e.target.value;
    if (!val) {
      onSortChange("", "asc");
      return;
    }
    const [newSortBy, newOrder] = val.split(":");
    onSortChange(newSortBy, newOrder || "asc");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* ── Search Input ────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-4 h-4"
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
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Search products by title..."
          className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
        />
        {inputValue && (
          <button
            type="button"
            onClick={onClearSearch}
            title="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Category Dropdown ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="w-full sm:w-48">
          <label htmlFor="category-select" className="sr-only">
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={categoriesLoading}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── Sort Dropdown ─────────────────────────────────────────────────── */}
        <div className="w-full sm:w-48">
          <label htmlFor="sort-select" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-select"
            value={currentSortKey}
            onChange={handleSortSelect}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="">Sort: Default</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="rating:desc">Rating: High to Low</option>
            <option value="rating:asc">Rating: Low to High</option>
            <option value="title:asc">Title: A to Z</option>
            <option value="title:desc">Title: Z to A</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;



