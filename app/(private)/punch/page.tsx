"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RequireAuth from "@/app/components/requireAuth";
import { useAuth } from "@/app/components/contexts/authContext";
import PunchModal from "@/app/components/punchModal";
import LogoutBtn from "@/app/components/logoutBtn";

import {
  punchInApi,
  punchOutApi,
  getTodayAttendanceApi,
  getAddressFromCoords,
} from "@/app/services/allApi";

import { getCurrentCoords } from "@/app/utils/getCurrentCoords";

type PunchStatus = "NONE" | "PUNCHED_IN" | "PUNCHED_OUT";

export default function PunchInPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchStatus, setPunchStatus] = useState<PunchStatus>("NONE");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ================= LOAD TODAY ATTENDANCE ================= */
  useEffect(() => {
    if (user?.id) {
      loadTodayAttendance();
      setShowPunchModal(true); // auto-open on first load
    }
  }, []);

  console.log(showPunchModal, punchStatus);
  const loadTodayAttendance = async () => {
    try {
      setInitialLoading(true);

      const res = await getTodayAttendanceApi();
      const attendance = res?.data?.data;
      console.log(attendance)

      // ✅ No record → allow punch in → open modal
      if (!attendance) {
        setPunchStatus("NONE");
        setShowPunchModal(false); // ❌ don't auto-open
        return;
      }

      // ✅ Once punched in → NEVER open modal again
      if (attendance.punchOut) {
        setPunchStatus("PUNCHED_OUT");
        setShowPunchModal(false);
      } else if (attendance.punchIn) {
        setPunchStatus("PUNCHED_IN");
        setShowPunchModal(false);
      }
    } catch (error) {
      setPunchStatus("NONE");
      setShowPunchModal(false);
    } finally {
      setInitialLoading(false);
    }
  };


  /* ================= PUNCH IN ================= */
  const handlePunchIn = async () => {
    try {
      setLoading(true);

      const { latitude, longitude } = await getCurrentCoords();
      const geoRes = await getAddressFromCoords(latitude, longitude);

      const res = await punchInApi(geoRes.address);

      if (!res?.error) {
        setShowPunchModal(false);
        await loadTodayAttendance();
        router.push("/dashboard");
      }
    } catch (error) {
      alert("Location permission is required to punch in");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUNCH OUT ================= */
  const handlePunchOut = async () => {
    try {
      setLoading(true);

      const { latitude, longitude } = await getCurrentCoords();
      const geoRes = await getAddressFromCoords(latitude, longitude);

      const res = await punchOutApi(geoRes.address);

      if (!res?.error) {
        await loadTodayAttendance();
      }
    } catch (error) {
      alert("Location permission is required to punch out");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <RequireAuth>
      <div> 
        {showPunchModal && (
          <PunchModal
            onClose={() => setShowPunchModal(false)}
            onConfirm={handlePunchIn}
            loading={loading}
          />
        )}
      </div>
    </RequireAuth>
  );
}
