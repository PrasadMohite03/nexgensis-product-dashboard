"use client";

import React, { useState, useEffect, useRef } from "react";

const SORT_OPTIONS = [
  { value: "", label: "Sort: Default" },
  { value: "price:asc", label: "Price: Low → High" },
  { value: "price:desc", label: "Price: High → Low" },
  { value: "rating:desc", label: "Rating: High → Low" },
  { value: "rating:asc", label: "Rating: Low → High" },
  { value: "title:asc", label: "Title: A → Z" },
  { value: "title:desc", label: "Title: Z → A" },
];

/**
 * FilterBar Component
 * Combines Search input, Category selector dropdown, and Sort selector dropdown.
 * All logic (mutual exclusion, debounce, URL sync) lives in the parent page — unchanged.
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const categoryRef = useRef(null);
  const sortRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    }
    if (isCategoryOpen || isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen, isSortOpen]);

  const searchActive = inputValue.trim().length > 0;
  const categoryActive = !!category;
  const sortActive = !!sortBy;

  // Selected category display name
  const selectedCatObj = categories.find((cat) => cat.slug === category);
  const selectedCategoryName = category
    ? selectedCatObj
      ? selectedCatObj.name
      : category
    : "All Categories";

  // Selected sort display label
  const currentSortOption =
    SORT_OPTIONS.find((opt) => opt.value === currentSortKey) || SORT_OPTIONS[0];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 mb-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* ── Search Input ────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={`w-4 h-4 transition-colors ${searchActive ? "text-[#4F46E5]" : "text-[#94A3B8]"}`}
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
          placeholder="Search products…"
          className={`w-full h-9 pl-9 pr-8 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] placeholder-[#94A3B8] text-[#0F172A] ${
            searchActive
              ? "border-[#4F46E5] bg-indigo-50/40"
              : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300"
          }`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Clear search"
            title="Clear search"
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Divider (md+) ─────────────────────────────────────────────────── */}
      <div className="hidden md:block h-5 w-px bg-[#E2E8F0] shrink-0" />

      {/* ── Category + Sort ─────────────────────────────────────────────── */}
      <div className="flex items-stretch gap-3">
        {/* Custom Category Dropdown */}
        <div className="relative flex-1 md:w-48 shrink-0" ref={categoryRef}>
          <button
            type="button"
            id="category-select"
            onClick={() => {
              setIsCategoryOpen((prev) => !prev);
              setIsSortOpen(false);
            }}
            disabled={categoriesLoading}
            aria-expanded={isCategoryOpen}
            aria-label="Category filter"
            className={`w-full h-9 px-3 text-sm rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer outline-none ${
              categoryActive
                ? "border-[#4F46E5] bg-indigo-50/40 text-indigo-700 font-semibold"
                : "border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 hover:border-slate-300"
            }`}
          >
            <span className="truncate capitalize">{selectedCategoryName}</span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isCategoryOpen ? "rotate-180 text-indigo-600" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Custom Category Dropdown List Panel with Modern Scrollbar */}
          {isCategoryOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden min-w-[200px]">
              <div className="overflow-y-auto max-h-56 p-1 custom-dropdown-scrollbar space-y-0.5">
                {/* All Categories Option */}
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange("");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    !category
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  {!category && (
                    <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Category Options List */}
                {categories.map((cat) => {
                  const isSelected = category === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.slug);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="capitalize">{cat.name}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Sort Dropdown */}
        <div className="relative flex-1 md:w-48 shrink-0" ref={sortRef}>
          <button
            type="button"
            id="sort-select"
            onClick={() => {
              setIsSortOpen((prev) => !prev);
              setIsCategoryOpen(false);
            }}
            aria-expanded={isSortOpen}
            aria-label="Sort by"
            className={`w-full h-9 px-3 text-sm rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer outline-none ${
              sortActive
                ? "border-[#4F46E5] bg-indigo-50/40 text-indigo-700 font-semibold"
                : "border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 hover:border-slate-300"
            }`}
          >
            <span className="truncate">{currentSortOption.label}</span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isSortOpen ? "rotate-180 text-indigo-600" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Custom Sort Dropdown Panel */}
          {isSortOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden min-w-[200px] w-full">
              <div className="overflow-y-auto max-h-56 p-1 custom-dropdown-scrollbar space-y-0.5">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = currentSortKey === opt.value;
                  return (
                    <button
                      key={opt.value || "default"}
                      type="button"
                      onClick={() => {
                        if (!opt.value) {
                          onSortChange("", "asc");
                        } else {
                          const [sBy, sOrd] = opt.value.split(":");
                          onSortChange(sBy, sOrd || "asc");
                        }
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;

