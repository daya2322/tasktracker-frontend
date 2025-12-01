"use client";

export default function PunchModal({ onClose, onConfirm }: any) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Punch In</h2>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to Punch In for today?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 border rounded-lg"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        onClick={onConfirm}
                    >
                        Punch In
                    </button>
                </div>
            </div>
        </div>
    );
}
