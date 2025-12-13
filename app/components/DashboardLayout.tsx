"use client";

import TopNavbar from "./TopNavbar";
import SubNavbar from "./SubNavbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top dark navbar */}
      <TopNavbar />

      {/* Secondary menu bar */}
      <SubNavbar />

      {/* Body */}
      <div className="flex">
        {/* Left icon sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
