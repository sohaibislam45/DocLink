import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DailyProvider, useDaily, useLocalSessionId,
         useParticipantIds, useVideoTrack, useAudioTrack } from "@daily-co/daily-react";
import { fetchRoom, getMeetingToken, endRoom } from "../api/rooms.js";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export default function CallRoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [meetingToken, setMeetingToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useAuth();
  const isDoctor = role === "doctor";

  useEffect(() => {
    const init = async () => {
      try {
        const roomData = await fetchRoom(roomId);
        setRoom(roomData);

        const { token } = await getMeetingToken({
          roomName: roomData.roomName,
          isOwner: isDoctor,
        });
        setMeetingToken(token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [roomId, isDoctor]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading call...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-900 text-red-500">{error}</div>;

  return (
    <DailyProvider url={room.roomUrl} token={meetingToken}>
      <CallRoom room={room} roomId={roomId} isDoctor={isDoctor} />
    </DailyProvider>
  );
}

function CallRoom({ room, roomId, isDoctor }) {
  const daily = useDaily();
  const navigate = useNavigate();
  const { user, socket } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0); // seconds
  const [postCallState, setPostCallState] = useState(null);
  // postCallState: null | "doctor-writing" | "prescription-issued"

  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // ── Call timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Join call on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    if (daily) daily.join();
    return () => { if (daily) daily.leave(); };
  }, [daily]);

  // ── Socket: listen for post-call events (patient side) ────────────────────
  useEffect(() => {
    if (!socket || isDoctor) return;

    const handleDoctorWriting = ({ patientUid }) => {
      if (patientUid === user.uid) setPostCallState("doctor-writing");
    };

    const handlePrescriptionIssued = ({ patientUid }) => {
      if (patientUid === user.uid) setPostCallState("prescription-issued");
    };

    socket.on("call:doctor-writing", handleDoctorWriting);
    socket.on("call:prescription-issued", handlePrescriptionIssued);

    return () => {
      socket.off("call:doctor-writing", handleDoctorWriting);
      socket.off("call:prescription-issued", handlePrescriptionIssued);
    };
  }, [socket, isDoctor, user]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const toggleMute = () => {
    daily.setLocalAudio(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    daily.setLocalVideo(isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const handleEndCall = async () => {
    daily.leave();

    if (isDoctor) {
      // 1. End room in backend + Daily.co
      await endRoom(roomId);

      // 2. Notify patient via socket
      socket.emit("call:end", { doctorId: room.doctorId, patientUid: room.patientUid });

      // 3. Emit "doctor is writing prescription"
      socket.emit("call:writing-prescription", {
        doctorId: room.doctorId,
        patientUid: room.patientUid,
      });

      // 4. Navigate doctor to prescription writer
      navigate(`/doctor/prescriptions/new?patient=${encodeURIComponent(room.patientUid)}&roomId=${roomId}`);
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
              <p className="text-slate-400 mb-6">Please wait while Dr. {room.doctorId} prepares your medical notes and prescription.</p>
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
    <div className="relative w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* ── Remote Participant (full screen) ── */}
      <div className="flex-1 relative">
        {remoteParticipantIds.length > 0 ? (
          <RemoteParticipantTile participantId={remoteParticipantIds[0]} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center"
            >
              <Video className="w-10 h-10 opacity-50" />
            </motion.div>
            <p className="text-xl font-medium">Waiting for other participant to join...</p>
          </div>
        )}

        {/* ── Local Participant (picture-in-picture) ── */}
        <div className="absolute bottom-24 right-6 w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10">
          <RemoteParticipantTile participantId={localSessionId} isLocal />
        </div>

        {/* ── Call info overlay (top bar) ── */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-white font-medium text-lg shadow-black drop-shadow-md">
                {isDoctor ? "In Consultation" : "Consulting Doctor"}
              </h2>
            </div>
            <p className="text-slate-300 text-sm shadow-black drop-shadow-md ml-6">
              Room: {room.roomName.split('-').pop()}
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-mono shadow-lg">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div className="h-24 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex items-center justify-center gap-6 px-6 z-20">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${
            isMuted 
              ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all ${
            isCameraOff 
              ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function RemoteParticipantTile({ participantId, isLocal = false }) {
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoTrack?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (audioRef.current && audioTrack?.persistentTrack && !isLocal) {
      audioRef.current.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }
  }, [audioTrack, isLocal]);

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local video to prevent echo
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
      />
      {!isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}
      
      {(!videoTrack || videoTrack.state === "off") && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-slate-500" />
          </div>
        </div>
      )}
    </div>
  );
}
