import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth.service";
import { clearAuth, getUser, isAuthenticated } from "@/utils/auth.utils";

/**
 * Custom hook that encapsulates all authentication logic.
 * UI components consume this hook and stay free of auth concerns.
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hydrate user state from localStorage on first render (client-only).
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  /**
   * Attempt login. Sets loading to prevent duplicate submissions.
   * On success: user state is set and the caller can navigate.
   * On failure: surfaces a human-readable error message.
   */
  async function login(credentials) {
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(credentials);
      const { accessToken, ...userProfile } = data;
      setUser(userProfile);
      router.push("/products");
    } catch (err) {
      // DummyJSON returns 400 for bad credentials.
      const message =
        err?.response?.data?.message ||
        "Invalid username or password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Clear all persisted auth data and redirect to login.
   */
  function logout() {
    clearAuth();
    setUser(null);
    router.push("/login");
  }

  return {
    user,
    isLoggedIn: !!user,
    loading,
    error,
    login,
    logout,
  };
}
