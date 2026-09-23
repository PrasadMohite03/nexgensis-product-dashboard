import api from "@/lib/axios";

export const getProducts = async ({ limit, skip }) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};