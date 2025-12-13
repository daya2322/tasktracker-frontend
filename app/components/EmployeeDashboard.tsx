import TaskSummaryChart from "./TaskSummaryChart";
import TaskTable from "./TaskTable";

export default function EmployeeDashboard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">– My Tasks</h2>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT – Donut Chart */}
        <div className="col-span-3">
          <TaskSummaryChart />
        </div>

        {/* RIGHT – Task List */}
        <div className="col-span-9">
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
