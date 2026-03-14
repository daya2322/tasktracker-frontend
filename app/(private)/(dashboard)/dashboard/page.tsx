"use client";

import Loading from "@/app/components/Loading";
import { isVerify } from "@/app/services/allApi";
import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch auth user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await isVerify();
      
      if (!res.error) {
        setRole(res.data.data.role);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center mt-20"><Loading /></div>;
  }

  return (
    <>
      {role === "Employee" && (
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Employee Dashboard</h1>
      )}

      {role === "Company" && (
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Company Dashboard</h1>
      )}

      {role === "Admin" && (
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h1>
      )}
    </>
  );
}
