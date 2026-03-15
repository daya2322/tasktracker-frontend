"use client";

import AdminDashboard from "@/app/components/adminDashboard";
import CompanyDashboard from "@/app/components/companyDashboard";
import EmployeeDashboard from "@/app/components/employeeDashboard";
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
        console.log("User role:", res.data.data.role);
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
        <EmployeeDashboard />
      )}

      {role === "Company" && (
        <CompanyDashboard />
      )}

      {role === "Admin" && (
        <AdminDashboard />
      )}
    </>
  );
}
