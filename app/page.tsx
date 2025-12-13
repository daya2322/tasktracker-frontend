"use client";

import { useEffect, useState } from "react";
import LoginPage from "./(public)/login/page";
import { isVerify } from "./services/allApi";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import { useSnackbar } from "./services/snackbarContext";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    let isMounted = true;

    async function verifyUser() {
      try {
        const res = await isVerify();

        if (!isMounted) return;

        if (res?.error) {
          localStorage.removeItem("token");
          setIsLoading(false);
        } else {
          localStorage.setItem("role", res?.data?.role?.id);
          localStorage.setItem(
            "country",
            res?.data?.companies?.[0]?.selling_currency
          );

          router.replace("/profile");
        }
      } catch (err) {
        if (isMounted) {
          showSnackbar("Verification failed", "error");
          setIsLoading(false);
        }
      }
    }

    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      verifyUser();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [router, showSnackbar]);

  if (isLoading) return <Loading />;

  return <LoginPage />;
}
