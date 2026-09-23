import { useState, useEffect, useRef } from "react";
import { getProducts } from "@/services/product.service";

/**
 * Fetches a page of products from DummyJSON.
 *
 * Accepts page and limit as inputs — this hook owns NO pagination state.
 * The caller (products/page.js) owns pagination via URL query params.
 *
 * @param {{ page: number, limit: number }} params
 * @returns {{ products, total, loading, error, retry }}
 */
export function useProducts({ page, limit }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Incrementing this counter is how we trigger a retry without changing page/limit.
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false; // Prevent stale state updates if params change quickly.

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const skip = (page - 1) * limit;
        const data = await getProducts({ limit, skip });

        if (!cancelled) {
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load products.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Cleanup: mark as cancelled so stale async responses are ignored.
    return () => {
      cancelled = true;
    };
  }, [page, limit, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { products, total, loading, error, retry };
}
