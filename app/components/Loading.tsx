"use client";

import Logo from "./logo";

export default function Loading({ isFullPage = true }: { isFullPage?: boolean }) {
  return (
    <div className={`w-full ${isFullPage ? "h-screen" : "h-full"} bg-white flex justify-center items-center relative`}>

      {/* Spinner */}
      <div className="animate-spin rounded-full h-[200px] w-[200px] border-t-2 border-b-2 border-gray-900 absolute z-10"></div>

      {/* Logo */}
      <Logo
        type="half"
        width={50}
        height={50}
        twClass="absolute z-20"
      />

    </div>
  );
}
