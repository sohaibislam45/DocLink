import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRoom, endRoom } from "../api/rooms.js";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function CallRoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useAuth();
  const isDoctor = role === "doctor";

  useEffect(() => {
    const init = async () => {
      try {
        const roomData = await fetchRoom(roomId);
        setRoom(roomData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [roomId]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading call...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-900 text-red-500">{error}</div>;

  return <CallRoom room={room} roomId={roomId} isDoctor={isDoctor} />;
}

function CallRoom({ room, roomId, isDoctor }) {
  const navigate = useNavigate();
  const { user, socket } = useAuth();

  const [postCallState, setPostCallState] = useState(null);
  // postCallState: null | "doctor-writing" | "prescription-issued"

  // ── Socket: listen for post-call events (patient side) ────────────────────
  useEffect(() => {
    if (!socket || isDoctor || !room) return;

    // Explicitly join the doctor's room to ensure we receive socket broadcasts
    // even if we navigated directly or hot-reloaded the CallRoomPage
    socket.emit("join:room", { doctorId: room.doctorId });

    const handleDoctorWriting = ({ patientUid }) => {
      if (patientUid === user.uid) setPostCallState("doctor-writing");
    };

    const handlePrescriptionIssued = ({ patientUid }) => {
      if (patientUid === user.uid) setPostCallState("prescription-issued");
    };

    const handleCallEnded = ({ patientUid }) => {
      if (patientUid === user.uid && !postCallState) {
        // Cut the call for the patient if the doctor ends it
        setPostCallState("doctor-writing");
      }
    };

    socket.on("call:doctor-writing", handleDoctorWriting);
    socket.on("call:prescription-issued", handlePrescriptionIssued);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:doctor-writing", handleDoctorWriting);
      socket.off("call:prescription-issued", handlePrescriptionIssued);
      socket.off("call:ended", handleCallEnded);
    };
  }, [socket, isDoctor, user, room, postCallState]);

  const handleEndCall = async () => {
    if (isDoctor) {
      // 1. End room in backend
      await endRoom(roomId);

      // 2. Notify patient via socket
      socket.emit("call:end", { doctorId: room.doctorId, patientUid: room.patientUid });

      // 3. Emit "doctor is writing prescription"
      socket.emit("call:writing-prescription", {
        doctorId: room.doctorId,
        patientUid: room.patientUid,
      });

      // 4. Navigate doctor to prescription writer
      navigate(`/doctor/prescriptions/new?patient=${encodeURIComponent(room.patientName || "Patient")}&uid=${encodeURIComponent(room.patientUid)}&roomId=${roomId}`);
    } else {
      // Patient: show "Doctor is writing prescription" screen
      setPostCallState("doctor-writing");
    }
  };

  // ── Post-call screen (patient only) ───────────────────────────────────────
  if (postCallState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white text-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          {postCallState === "doctor-writing" ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold mb-2">Doctor is writing your prescription</h2>
              <p className="text-slate-400 mb-6">Please wait while the doctor prepares your medical notes and prescription.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Prescription Ready!</h2>
              <p className="text-slate-400 mb-6">Your consultation has concluded and your prescription is available in your dashboard.</p>
              <button 
                onClick={() => navigate('/patient/prescriptions')}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl transition-colors font-medium"
              >
                View Prescription
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950">
      <JitsiMeeting
        roomName={room.roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: user?.displayName || (isDoctor ? "Doctor" : "Patient")
        }}
        onApiReady={(externalApi) => {
          // Listen for the hangup event
          externalApi.addListener("videoConferenceLeft", () => {
            handleEndCall();
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
