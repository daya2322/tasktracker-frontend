"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function useIdleLogout(timeout = 300000) {
  const router = useRouter();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const logout = () => {
      localStorage.removeItem("token");
      router.push("/login");
    };

    const resetTimer = () => {
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        logout();
      }, timeout);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [router, timeout]);
}
