import api from "@/lib/axios";
import { saveAuth } from "@/utils/auth.utils";

/**
 * Sends login credentials to DummyJSON and persists the returned token + user.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<object>} The full response data from DummyJSON
 */
export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);
  const data = response.data;

  // Persist token and user profile so the Axios interceptor & guards can use them.
  const { accessToken, ...user } = data;
  saveAuth(accessToken, user);

  return data;
}