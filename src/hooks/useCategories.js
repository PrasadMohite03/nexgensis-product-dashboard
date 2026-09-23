"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/services/product.service";

/**
 * Custom hook to fetch the product categories list once on mount.
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCategories()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          const normalized = data.map((item) => {
            if (typeof item === "string") {
              const formattedName = item
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              return { slug: item, name: formattedName };
            }
            return {
              slug: item.slug || item.name,
              name: item.name || item.slug,
            };
          });
          setCategories(normalized);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
}
