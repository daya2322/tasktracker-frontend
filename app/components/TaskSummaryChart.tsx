"use client";

import { PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "Closed Late", value: 1 },
];

const COLORS = ["#f4b45f"];

export default function TaskSummaryChart() {
  return (
    <div className="flex flex-col items-center">
      <PieChart width={180} height={180}>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>

      <div className="text-center mt-2">
        <p className="text-blue-600 font-semibold">Total 1</p>
        <p className="text-sm text-gray-500">Closed but late</p>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1 text-sm">
        <p><span className="text-red-500">■</span> Late</p>
        <p><span className="text-purple-500">■</span> Today</p>
        <p><span className="text-pink-500">■</span> Open</p>
        <p><span className="text-green-500">■</span> Closed</p>
        <p><span className="text-orange-400">■</span> Closed but late</p>
      </div>
    </div>
  );
}
