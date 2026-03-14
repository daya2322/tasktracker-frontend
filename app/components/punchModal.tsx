"use client";

import { useEffect } from "react";

type PunchModalProps = {
  onClose: () => void;
  onConfirm?: () => void;
  loading: boolean;
};

export default function PunchModal({
  onClose,
  onConfirm,
  loading,
}: PunchModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Punch In</h2>

        <p className="text-gray-700 mb-6">
          Are you sure you want to Punch In for today?
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Punching In..." : "Punch In"}
          </button>
        </div>
      </div>
    </div>
  );
}
