"use client";

import { useAuth } from "@/app/components/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  if (!user) return null;

  return <>{children}</>;
}
