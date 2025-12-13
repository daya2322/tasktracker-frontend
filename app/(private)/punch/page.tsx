"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/app/components/requireAuth";
import { useAuth } from "@/app/components/contexts/authContect";
import PunchModal from "@/app/components/punchModal";
import LogoutBtn from "@/app/components/logoutBtn";

// Attendance APIs
import {
  punchInApi,
  punchOutApi,
  getTodayAttendanceApi,
  getAddressFromCoords
} from "@/app/services/allApi";

// Location helpers
import { getCurrentCoords } from "@/app/utils/getCurrentCoords";

type PunchStatus = "NONE" | "PUNCHED_IN" | "PUNCHED_OUT";

export default function DashboardPage() {
  const { user } = useAuth();

  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchStatus, setPunchStatus] = useState<PunchStatus>("NONE");
  const [loading, setLoading] = useState(false);

  /**
   * Load today's attendance on page load
   */
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    const res = await getTodayAttendanceApi();

    if (!res.error && res.data?.data) {
      const attendance = res.data.data;

      if (attendance.punchOut) {
        setPunchStatus("PUNCHED_OUT");
      } else if (attendance.punchIn) {
        setPunchStatus("PUNCHED_IN");
      }
    }
  };

  /**
   * Punch In
   */
  const handlePunchIn = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get coordinates from browser
      const { latitude, longitude } = await getCurrentCoords();

      // 2️⃣ Convert coords → address via backend
      const geoRes = await getAddressFromCoords(latitude, longitude);
      if (!geoRes.status) throw new Error("Address fetch failed");

      // 3️⃣ Punch in with address
      const res = await punchInApi(geoRes.address);
      if (!res.error) {
        setPunchStatus("PUNCHED_IN");
        setShowPunchModal(false);
      }
    } catch (error) {
      alert("Location permission is required");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Punch Out
   */
  const handlePunchOut = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get coordinates
      const { latitude, longitude } = await getCurrentCoords();

      // 2️⃣ Convert coords → address
      const geoRes = await getAddressFromCoords(latitude, longitude);
      if (!geoRes.status) throw new Error("Address fetch failed");

      // 3️⃣ Punch out with address
      const res = await punchOutApi(geoRes.address);
      if (!res.error) {
        setPunchStatus("PUNCHED_OUT");
      }
    } catch (error) {
      alert("Location permission is required");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">
              Welcome, {user?.name}
            </h1>
            <LogoutBtn />
          </div>

          {/* Attendance Section */}
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-3">
              Attendance Status
            </h2>

            {/* NOT PUNCHED IN */}
            {punchStatus === "NONE" && (
              <>
                <p className="text-gray-700 mb-3">
                  You haven't punched in yet today.
                </p>
                <button
                  onClick={() => setShowPunchModal(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Punch In
                </button>
              </>
            )}

            {/* PUNCHED IN */}
            {punchStatus === "PUNCHED_IN" && (
              <>
                <p className="text-green-700 mb-3 font-semibold">
                  ✔ You have punched in.
                </p>
                <button
                  onClick={handlePunchOut}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Punch Out
                </button>
              </>
            )}

            {/* PUNCHED OUT */}
            {punchStatus === "PUNCHED_OUT" && (
              <p className="text-gray-700 font-semibold">
                ✔ You have punched out for today.
              </p>
            )}
          </div>
        </div>

        {/* Punch In Confirmation Modal */}
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
