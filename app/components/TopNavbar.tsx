"use client";

import { Search } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="h-16 bg-[#0b1e3a] text-white flex items-center justify-between px-6">
      <div className="text-xl font-bold tracking-wide">
        Work<span className="text-pink-500">Sphere</span>
      </div>
      <div className="relative w-[420px]">
        <Search className="absolute left-3 top-2.5 text-white-400" size={18} />
        <input
          placeholder="Search by Team Member Name / Bucket Name"
          className="w-full pl-10 pr-4 py-2 rounded-md text-sm text-white bg-[#112a4e] placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm">Days Left : 292</span>

        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm">Dayanand</span>
        </div>
      </div>
    </header>
  );
}
