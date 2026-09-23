import { useState } from "react";
import {
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "@/services/product.service";

/**
 * Custom hook to execute product CRUD mutations with submission locking & error handling.
 */
export function useProductMutations() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createProduct = async (productData) => {
    if (submitting) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiCreateProduct(productData);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add product.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProduct = async (id, productData) => {
    if (submitting) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiUpdateProduct(id, productData);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update product.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (submitting) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiDeleteProduct(id);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete product.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    setError,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
