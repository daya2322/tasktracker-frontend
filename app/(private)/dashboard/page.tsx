"use client";

import { useState, useEffect } from "react";
import RequireAuth from "@/app/components/requireAuth";
import { useAuth } from "@/app/components/contexts/authContect";
import PunchModal from "@/app/components/punchModal";
import LogoutBtn from "@/app/components/logoutBtn";

export default function DashboardPage() {
    const { user } = useAuth();
    const [showPunchModal, setShowPunchModal] = useState(false);
    const [punchStatus, setPunchStatus] = useState<"NONE" | "PUNCHED_IN">("NONE");

    // Load punch status from localStorage (you can replace with API)
    useEffect(() => {
        const stored = localStorage.getItem("punchStatus");
        if (stored) setPunchStatus(stored as "PUNCHED_IN");
    }, []);

    const handlePunchIn = () => {
        localStorage.setItem("punchStatus", "PUNCHED_IN");
        setPunchStatus("PUNCHED_IN");
        setShowPunchModal(false);
    };

    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
                        <LogoutBtn />
                    </div>

                    {/* Punch In Section */}
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">
                            Attendance Status
                        </h2>

                        {punchStatus === "NONE" ? (
                            <>
                                <p className="text-gray-700 mb-3">You haven't punched in yet today.</p>
                                <button
                                    onClick={() => setShowPunchModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Punch In
                                </button>
                            </>
                        ) : (
                            <div className="text-green-700 font-semibold">
                                ✔ You have punched in today.
                            </div>
                        )}
                    </div>
                </div>

                {showPunchModal && (
                    <PunchModal
                        onClose={() => setShowPunchModal(false)}
                        onConfirm={handlePunchIn}
                    />
                )}
            </div>
        </RequireAuth>
    );
}
