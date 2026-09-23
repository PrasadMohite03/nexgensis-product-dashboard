"use client";

import { createContext, useContext, useState } from "react";

/**
 * ProductMutationContext
 *
 * Holds the client-side mutation overlay that bridges DummyJSON's
 * non-persistent API with real UI consistency.
 *
 * Both /products (list) and /products/[id] (detail) consume this context
 * so that a locally-created or locally-edited product is visible on both
 * pages without a round-trip to the server.
 *
 * State kept here:
 *   createdProducts    – array of products added via "Add Product" this session.
 *   updatedProductsMap – { [id]: partialProduct } keyed by product ID.
 *   deletedProductIds  – Set<id> of products deleted this session.
 */
const ProductMutationContext = createContext(null);

export function ProductMutationProvider({ children }) {
  const [createdProducts, setCreatedProducts] = useState([]);
  const [updatedProductsMap, setUpdatedProductsMap] = useState({});
  const [deletedProductIds, setDeletedProductIds] = useState(() => new Set());

  /** Prepend a newly-created product to the overlay list. */
  function addCreatedProduct(product) {
    setCreatedProducts((prev) => [product, ...prev]);
  }

  /**
   * Record a local update for a product.
   * Stores under both the original id and its string form so lookups work
   * regardless of whether the caller uses a number or string key.
   */
  function addUpdatedProduct(id, partialData) {
    setUpdatedProductsMap((prev) => {
      const merged = { ...(prev[id] ?? prev[String(id)] ?? {}), ...partialData };
      return {
        ...prev,
        [id]: merged,
        [String(id)]: merged,
      };
    });
  }

  /**
   * Mark a product as locally deleted.
   * Stores both the original value and its numeric/string counterpart
   * so Set.has() succeeds whether the caller passes a number or a string.
   */
  function addDeletedProduct(id) {
    setDeletedProductIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      // Store the coerced counterpart so both string and number lookups work
      const asNum = Number(id);
      if (!isNaN(asNum)) next.add(asNum);
      next.add(String(id));
      return next;
    });
  }

  return (
    <ProductMutationContext.Provider
      value={{
        createdProducts,
        updatedProductsMap,
        deletedProductIds,
        addCreatedProduct,
        addUpdatedProduct,
        addDeletedProduct,
      }}
    >
      {children}
    </ProductMutationContext.Provider>
  );
}

/**
 * useProductMutationContext
 * Must be called inside a <ProductMutationProvider>.
 */
export function useProductMutationContext() {
  const ctx = useContext(ProductMutationContext);
  if (!ctx) {
    throw new Error(
      "useProductMutationContext must be used within <ProductMutationProvider>"
    );
  }
  return ctx;
}
