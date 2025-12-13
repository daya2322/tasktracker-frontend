"use client";

const menus = [
  "Add Task",
  "Timesheet",
  "Your Calendar",
  "Attendance",
  "Reports",
  "Item List",
  "Notice Board",
];

export default function SubNavbar() {
  return (
    <nav className="bg-gray-200 px-6 py-3 flex gap-6 text-sm font-medium">
      {menus.map((menu) => (
        <button
          key={menu}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          {menu}
        </button>
      ))}
    </nav>
  );
}
