import { useState, useEffect } from "react";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
} from "@/services/product.service";

/**
 * Fetches a page of products, optionally filtered by a search query or category,
 * and optionally sorted by field and order.
 *
 * Accepts page, limit, search, category, sortBy, order as inputs — this hook owns NO
 * pagination, filtering or search state. The caller (products/page.js) owns those via URL params.
 *
 * Race-condition protection uses two complementary guards:
 *
 *   1. AbortController + signal
 *      An AbortController is created for each effect run. Its signal is passed
 *      to API calls so Axios can cancel the HTTP request itself when the effect cleans up.
 *
 *   2. `cancelled` boolean (stale-response guard)
 *      Handles the narrow window where the HTTP response arrives just as React
 *      is tearing down the effect. Any state update is gated behind `if (!cancelled)`.
 *
 * @param {{ page: number, limit: number, search?: string, category?: string, sortBy?: string, order?: string }} params
 * @returns {{ products, total, loading, error, retry }}
 */
export function useProducts({ page, limit, search, category, sortBy, order }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Incrementing retryCount re-triggers the effect without changing params.
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
        const trimmedCategory = category?.trim() ?? "";

        let data;

        if (trimmedCategory) {
          data = await getProductsByCategory({
            category: trimmedCategory,
            limit,
            skip,
            sortBy,
            order,
            signal: controller.signal,
          });
        } else if (trimmedSearch) {
          data = await searchProducts({
            query: trimmedSearch,
            limit,
            skip,
            signal: controller.signal,
          });
        } else {
          data = await getProducts({
            limit,
            skip,
            sortBy,
            order,
            signal: controller.signal,
          });
        }

        // Guard 2: only update state if this effect is still the latest one.
        if (!cancelled) {
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          // Guard: do NOT show an error for a cancelled/aborted request.
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
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, search, category, sortBy, order, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { products, total, loading, error, retry };
}

