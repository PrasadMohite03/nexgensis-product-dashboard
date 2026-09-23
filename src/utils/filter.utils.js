const ALLOWED_SORT_BY = ["price", "rating", "title"];
const ALLOWED_ORDER = ["asc", "desc"];

/**
 * Validates and returns a allowed sortBy value.
 * @param {string|null} value
 * @returns {string} Allowed sortBy field or "" if invalid/none
 */
export function parseSortBy(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  return ALLOWED_SORT_BY.includes(trimmed) ? trimmed : "";
}

/**
 * Validates and returns an allowed order value.
 * @param {string|null} value
 * @returns {string} "asc" or "desc"
 */
export function parseOrder(value) {
  if (!value || typeof value !== "string") return "asc";
  const trimmed = value.trim();
  return ALLOWED_ORDER.includes(trimmed) ? trimmed : "asc";
}

/**
 * Normalizes category parameter against the list of known valid categories.
 * Handles both object list [{slug, name}] and string list ['beauty', 'laptops'].
 *
 * @param {string|null} value
 * @param {Array<string|{slug: string, name: string}>} validCategories
 * @returns {string} Category slug or "" if invalid
 */
export function parseCategory(value, validCategories = []) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  // If validCategories list is empty (e.g. initial load before categories fetch finishes),
  // return the trimmed string temporarily so valid URL params aren't dropped.
  if (!validCategories || validCategories.length === 0) {
    return trimmed;
  }

  const matches = validCategories.some((cat) => {
    if (typeof cat === "string") return cat === trimmed;
    return cat && cat.slug === trimmed;
  });

  return matches ? trimmed : "";
}
