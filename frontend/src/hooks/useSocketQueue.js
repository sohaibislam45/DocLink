import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "../lib/socket.js";
import { auth } from "../lib/firebase.js";
import { showSuccess } from "../lib/swal.js";
import {
  joinQueue as apiJoinQueue,
  leaveQueue as apiLeaveQueue,
} from "../api/queues.js";

export const useSocketQueue = (doctor) => {
  const [queue, setQueue] = useState([]);           // full active queue array
  const [myEntry, setMyEntry] = useState(null);     // current patient's entry
  const [isInQueue, setIsInQueue] = useState(false);
  const [isCalled, setIsCalled] = useState(false);  // "Doctor is calling you!"
  const [isYourTurn, setIsYourTurn] = useState(false); // position === 1 + called
  const [incomingCall, setIncomingCall] = useState(null); // { roomId, roomUrl }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const wasDisconnected = useRef(false);
  const socket = getSocket();
  const doctorId = doctor?.id || doctor?._id; // handle both id formats

  const syncMyEntry = useCallback((queueData) => {
    const uid = auth.currentUser?.uid;
    const entry = queueData.find((e) => e.patientUid === uid);
    setMyEntry(entry || null);
    setIsInQueue(!!entry);
    setIsYourTurn(!!entry && entry.position === 1 && entry.status === "called");
    
    // If the entry status is 'called', set isCalled to true for the patient
    if (entry?.status === "called") {
        setIsCalled(true);
    }
  }, []);

  useEffect(() => {
    if (!socket || !doctorId) return;

    console.log(`Setting up socket listeners for doctor: ${doctorId}`);
    
    // Join the doctor's Socket.io room
    socket.emit("join:room", { doctorId });

    // Receive full queue state on room join (initial load)
    socket.on("queue:state", (queueData) => {
      console.log("Received initial queue state:", queueData);
      setQueue(queueData);
      syncMyEntry(queueData);
      setLoading(false);
    });

    // Receive live queue updates (any change)
    socket.on("queue:updated", (queueData) => {
      console.log("Queue updated:", queueData);
      setQueue(queueData);
      syncMyEntry(queueData);
    });

    // Doctor called this specific patient
    socket.on("queue:patient-called", ({ patientUid }) => {
      const uid = auth.currentUser?.uid;
      if (uid === patientUid) {
        setIsCalled(true);  // triggers full-screen overlay
      }
    });

    // Receive Daily.co room info
    socket.on("call:incoming", ({ patientUid, roomId, roomUrl }) => {
      const uid = auth.currentUser?.uid;
      if (uid === patientUid) {
        setIncomingCall({ roomId, roomUrl });
      }
    });

    // Reconnection: restore queue state
    socket.on("connect", () => {
      if (wasDisconnected.current) {
        showSuccess("Reconnected: Your queue position has been restored.");
      }
      wasDisconnected.current = false;
      socket.emit("join:room", { doctorId });
    });

    socket.on("disconnect", () => {
      wasDisconnected.current = true;
    });

    return () => {
      console.log(`Cleaning up socket listeners for doctor: ${doctorId}`);
      socket.off("queue:state");
      socket.off("queue:updated");
      socket.off("queue:patient-called");
      socket.off("call:incoming");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, doctorId, syncMyEntry]);

  // Patient joins queue
  const joinQueue = useCallback(async (name, reason) => {
    try {
      setLoading(true);
      await apiJoinQueue({ doctorId, patientName: name, reason });
      socket.emit("queue:join", { doctorId });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [doctorId, socket]);

  // Patient leaves queue
  const leaveQueue = useCallback(async () => {
    try {
      setLoading(true);
      await apiLeaveQueue();
      socket.emit("queue:leave", { doctorId });
      setMyEntry(null);
      setIsInQueue(false);
      setIsCalled(false);
      setIncomingCall(null);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [doctorId, socket]);

  // Compute patientsAhead from queue array (exclude current user)
  const uid = auth.currentUser?.uid;
  const patientsAhead = queue
    .filter((e) => e.patientUid !== uid && e.position < (myEntry?.position ?? Infinity))
    .map((e, i) => ({
      id: e._id,
      label: `Patient ${String.fromCharCode(65 + i)}`,
      estimatedWaitMins: e.estimatedWaitMins,
      status: e.status,
    }));

  return {
    queue,               // full queue (for doctor view)
    myEntry,             // patient's own entry
    isInQueue,
    isCalled,            // triggers "Doctor is calling you!" overlay
    setIsCalled,         // allow manual dismissal
    incomingCall,        // Daily.co room info
    isYourTurn,          // triggers YourTurnCard
    patientsAhead,       // anonymized list for patient queue panel
    loading,
    error,
    joinQueue,
    leaveQueue,
  };
};
