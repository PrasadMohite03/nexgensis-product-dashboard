import api from "@/lib/axios";

/**
 * Fetches a paginated list of all products with optional sorting.
 * Used when there is no active search query or category filter.
 *
 * @param {{ limit: number, skip: number, sortBy?: string, order?: string, signal?: AbortSignal }} params
 */
export const getProducts = async ({ limit, skip, sortBy, order, signal }) => {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    if (order) params.order = order;
  }

  const response = await api.get("/products", {
    params,
    signal,
  });
  return response.data;
};

/**
 * Searches products by a query string using DummyJSON /products/search.
 * Accepts an AbortController signal so the caller can cancel in-flight requests.
 *
 * @param {{ query: string, limit: number, skip: number, signal?: AbortSignal }} params
 */
export const searchProducts = async ({ query, limit, skip, signal }) => {
  const response = await api.get("/products/search", {
    params: { q: query, limit, skip },
    signal,
  });
  return response.data;
};

/**
 * Fetches all product categories.
 * GET /products/categories
 */
export const getCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

/**
 * Fetches paginated products within a specific category with optional sorting.
 * GET /products/category/{category}
 *
 * @param {{ category: string, limit: number, skip: number, sortBy?: string, order?: string, signal?: AbortSignal }} params
 */
export const getProductsByCategory = async ({
  category,
  limit,
  skip,
  sortBy,
  order,
  signal,
}) => {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    if (order) params.order = order;
  }

  const response = await api.get(`/products/category/${encodeURIComponent(category)}`, {
    params,
    signal,
  });
  return response.data;
};

/**
 * Fetches a single product by ID.
 * GET /products/{id}
 *
 * @param {string|number} id
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getProductById = async (id, { signal } = {}) => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`, {
    signal,
  });
  return response.data;
};