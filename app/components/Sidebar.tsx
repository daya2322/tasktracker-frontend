"use client";

import {
  Sliders,
  Trash2,
  Palette,
  User,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-16 bg-white shadow flex flex-col items-center py-6 gap-6">
      <IconButton icon={<Sliders size={18} />} />
      <IconButton icon={<Trash2 size={18} />} />
      <IconButton icon={<Palette size={18} />} />
      <IconButton icon={<User size={18} />} />
    </aside>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
      {icon}
    </button>
  );
}
