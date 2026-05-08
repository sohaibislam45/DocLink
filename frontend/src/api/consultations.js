import { auth } from "../lib/firebase.js";

const BASE = import.meta.env.VITE_API_BASE_URL;

const getToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");
  return token;
};

export const fetchMyConsultations = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/consultations/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch consultations");
  return res.json();
};

export const createConsultation = async (data) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create consultation");
  return res.json();
};
