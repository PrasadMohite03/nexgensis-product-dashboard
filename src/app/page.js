"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth.utils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Route the user to the appropriate page based on auth state.
    if (isAuthenticated()) {
      router.replace("/products");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // Blank screen during redirect — no flash of content.
  return null;
}