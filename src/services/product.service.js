import api from "@/lib/axios";

/**
 * Fetches a paginated list of all products.
 * Used when there is no active search query.
 *
 * @param {{ limit: number, skip: number }} params
 */
export const getProducts = async ({ limit, skip, signal }) => {
  const response = await api.get("/products", {
    params: { limit, skip },
    signal, // allows AbortController to cancel this request too
  });
  return response.data;
};

/**
 * Searches products by a query string using DummyJSON /products/search.
 * Accepts an AbortController signal so the caller can cancel in-flight requests.
 *
 * @param {{ query: string, limit: number, skip: number, signal: AbortSignal }} params
 */
export const searchProducts = async ({ query, limit, skip, signal }) => {
  const response = await api.get("/products/search", {
    params: { q: query, limit, skip },
    signal, // Axios forwards this to the underlying fetch; abort() cancels the request
  });
  return response.data;
};