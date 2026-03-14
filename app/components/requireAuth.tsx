"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/authContext";
import Loading from "./Loading";

export default function RequireAuth({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return <Loading />;

    if (!user) return null;

    return <>{children}</>;
}
