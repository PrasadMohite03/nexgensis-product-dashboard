const ALLOWED_LIMITS = [10, 20, 50];
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * Parses a URL string value into a safe page number.
 * Any non-integer, NaN, 0, or negative value falls back to DEFAULT_PAGE.
 */
export function parsePage(value) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) return DEFAULT_PAGE;
  return n;
}

/**
 * Parses a URL string value into a safe limit.
 * Only 10, 20, 50 are accepted; anything else falls back to DEFAULT_LIMIT.
 */
export function parseLimit(value) {
  const n = parseInt(value, 10);
  if (ALLOWED_LIMITS.includes(n)) return n;
  return DEFAULT_LIMIT;
}

/**
 * Returns the total number of pages.
 */
export function getTotalPages(total, limit) {
  if (!total || !limit) return 1;
  return Math.ceil(total / limit);
}

/**
 * Builds the array of page numbers to display, inserting null for ellipsis gaps.
 * Always shows first, last, current, and 1 neighbour on each side.
 *
 * Example for page 7 of 20:
 *   [1, null, 6, 7, 8, null, 20]
 */
export function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    // No ellipsis needed — show all pages.
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages]);

  // Current page neighbours
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push(null); // null represents an ellipsis
    }
    result.push(sorted[i]);
  }

  return result;
}
