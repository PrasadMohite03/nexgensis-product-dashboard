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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-3">
      {/* Left: Showing X–Y of Z + page size selector */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          Showing{" "}
          <span className="font-medium text-gray-900">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{total}</span>
        </span>

        <label htmlFor="page-size-select" className="sr-only">
          Rows per page
        </label>
        <select
          id="page-size-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {/* Right: Previous, page numbers, Next */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          id="prev-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        {/* Page number buttons */}
        {pageNumbers.map((page, idx) =>
          page === null ? (
            // Ellipsis
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1.5 text-sm text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              id={`page-btn-${page}`}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-indigo-600 text-white border border-indigo-600"
                  : "text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          id="next-page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
