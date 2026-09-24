import { getPageNumbers } from "@/utils/pagination.utils";

/**
 * Fully controlled pagination bar — no internal state.
 *
 * Props:
 *   currentPage    — active page number
 *   totalPages     — total number of pages
 *   limit          — current page size
 *   total          — total number of records (for "Showing X–Y of Z")
 *   onPageChange   — (page: number) => void
 *   onLimitChange  — (limit: number) => void
 */
export default function Pagination({
  currentPage,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Calculate the "Showing X–Y of Z" range.
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1">
      {/* Left: Showing X–Y of Z + page size selector */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of <span className="font-semibold text-slate-900">{total}</span> results
        </span>

        <label htmlFor="page-size-select" className="sr-only">
          Rows per page
        </label>
        <select
          id="page-size-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-pointer transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {/* Right: Previous, page numbers, Next */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          id="prev-page-btn"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) =>
            page === null ? (
              // Ellipsis
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-8 text-xs text-slate-400 select-none flex items-center justify-center font-medium"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                id={`page-btn-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  page === currentPage
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          id="next-page-btn"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Next
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
