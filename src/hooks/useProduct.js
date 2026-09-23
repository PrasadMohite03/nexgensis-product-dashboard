import { useState, useEffect } from "react";
import { getProductById } from "@/services/product.service";

/**
 * Custom hook to fetch a single product by ID.
 * Features AbortController cleanup, stale response guard, 404 handling, and retry capability.
 *
 * @param {string|number} id
 * @returns {{ product: object|null, loading: boolean, error: string|null, isNotFound: boolean, retry: function }}
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Incremented to force a re-fetch without changing id
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setIsNotFound(true);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      setIsNotFound(false);

      try {
        const data = await getProductById(id, { signal: controller.signal });
        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          const isCancellation =
            err.name === "CanceledError" ||
            err.name === "AbortError" ||
            err.code === "ERR_CANCELED";

          if (!isCancellation) {
            if (err.response?.status === 404) {
              setIsNotFound(true);
            } else {
              setError(
                err?.response?.data?.message || "Failed to load product details."
              );
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { product, loading, error, isNotFound, retry };
}
