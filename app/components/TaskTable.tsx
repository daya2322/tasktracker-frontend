import TaskRow from "./TaskRow";

const tasks = [
  {
    bucket: "Riham",
    priority: "High",
    title:
      "Master Route Agent Customer Company Role Transaction Cash Collection Exchange Advance Payment",
    dueDate: "12/11/2025",
    dueTime: "8:00 PM",
    assignedTo: "My Self",
  },
];

export default function TaskTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="text-left py-2">Bucket</th>
            <th className="text-left">Task</th>
            <th className="text-left">Due</th>
            <th className="text-left">Actions</th>
            <th className="text-left">Closed</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task, index) => (
            <TaskRow key={index} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
