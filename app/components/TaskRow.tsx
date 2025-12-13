export default function TaskRow({ task }: any) {
  return (
    <tr className="border-b">
      {/* Bucket */}
      <td className="py-4">
        <p className="font-medium">{task.bucket}</p>
        <span className="text-xs text-gray-400">● {task.priority}</span>
      </td>

      {/* Task */}
      <td>
        <p className="text-blue-600 font-medium line-clamp-2">
          Task<br />
          {task.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Assigned by – Raj Yadav
        </p>
      </td>

      {/* Due */}
      <td>
        <p className="text-red-500 flex items-center gap-1">
          📅 {task.dueDate}
        </p>
        <p className="text-red-400">⏰ {task.dueTime}</p>
      </td>

      {/* Actions */}
      <td className="space-y-1 text-sm text-gray-600">
        <p>👤 {task.assignedTo}</p>
        <p>➕ Add Remark</p>
        <p>📎 Add Attachment</p>
      </td>

      {/* Closed */}
      <td>
        <button className="px-3 py-1 text-xs bg-gray-200 rounded">
          Reopen
        </button>
      </td>
    </tr>
  );
}
