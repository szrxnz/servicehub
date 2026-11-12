"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/** บังคับให้หน้านี้ต้อง login — ถ้ายังไม่ได้ login จะพาไปหน้า /login */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
