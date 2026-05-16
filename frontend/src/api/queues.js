import { auth } from "../lib/firebase.js";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return await user.getIdToken();
};

export const fetchActiveQueue = async (doctorId) => {
  const res = await fetch(`${BASE}/api/queues/${doctorId}`);
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
};

export const joinQueue = async ({ doctorId, patientName, reason }) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/queues/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ doctorId, patientName, reason }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to join queue");
  }
  return res.json();
};

export const leaveQueue = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/queues/leave`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to leave queue");
  return res.json();
};

export const fetchMyQueueEntry = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/queues/my-entry`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch queue entry");
  return res.json();
};
