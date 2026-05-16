import { auth } from "../lib/firebase.js";

const BASE = import.meta.env.VITE_API_BASE_URL;

const getToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");
  return token;
};

export const createRoom = async ({ doctorId, patientUid }) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/rooms/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ doctorId, patientUid }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json(); // { roomId, roomName, roomUrl }
};

export const getMeetingToken = async ({ roomName, isOwner }) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/rooms/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roomName, isOwner }),
  });
  if (!res.ok) throw new Error("Failed to get meeting token");
  return res.json(); // { token }
};

export const fetchRoom = async (roomId) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Room not found");
  return res.json();
};

export const endRoom = async (roomId) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/rooms/${roomId}/end`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to end room");
  return res.json();
};
