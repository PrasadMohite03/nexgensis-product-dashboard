import { useState, useEffect } from "react";
import { getProducts, searchProducts } from "@/services/product.service";

/**
 * Fetches a page of products, optionally filtered by a search query.
 *
 * Accepts page, limit, and search as inputs — this hook owns NO pagination
 * or search state. The caller (products/page.js) owns those via URL params.
 *
 * Race-condition protection uses two complementary guards:
 *
 *   1. AbortController + signal
 *      An AbortController is created for each effect run. Its signal is passed
 *      to searchProducts (and getProducts) so Axios can cancel the HTTP request
 *      itself when the effect cleans up (i.e. when page/limit/search changes).
 *
 *   2. `cancelled` boolean (stale-response guard)
 *      Handles the narrow window where the HTTP response arrives just as React
 *      is tearing down the effect (Axios may not abort in time). Any state
 *      update is gated behind `if (!cancelled)` so stale data never reaches
 *      the component tree.
 *
 * A cancelled or aborted request does NOT show an error to the user.
 *
 * @param {{ page: number, limit: number, search: string }} params
 * @returns {{ products, total, loading, error, retry }}
 */
export function useProducts({ page, limit, search }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Incrementing retryCount re-triggers the effect without changing page/limit/search.
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // ── Guard 2: stale-response flag ──────────────────────────────────────────
    let cancelled = false;

    // ── Guard 1: AbortController for HTTP-level cancellation ─────────────────
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const skip = (page - 1) * limit;
        const trimmedSearch = search?.trim() ?? "";

        // Branch: use search endpoint when a query is present.
        const data = trimmedSearch
          ? await searchProducts({
              query: trimmedSearch,
              limit,
              skip,
              signal: controller.signal,
            })
          : await getProducts({
              limit,
              skip,
              signal: controller.signal,
            });

        // Guard 2: only update state if this effect is still the latest one.
        if (!cancelled) {
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          // Guard: do NOT show an error for a cancelled/aborted request.
          // Axios names the error "CanceledError"; the browser uses "AbortError".
          const isCancellation =
            err.name === "CanceledError" ||
            err.name === "AbortError" ||
            err.code === "ERR_CANCELED";

          if (!isCancellation) {
            setError(err?.response?.data?.message || "Failed to load products.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Cleanup: runs before the next effect and on unmount.
    //   - Set cancelled = true so any in-flight .then() ignores the response.
    //   - Abort the HTTP request itself so the network call is also cancelled.
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, search, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { products, total, loading, error, retry };
}
