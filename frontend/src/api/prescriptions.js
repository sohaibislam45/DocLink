import { auth } from "../lib/firebase.js";

const BASE = import.meta.env.VITE_API_BASE_URL;

const getToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");
  return token;
};

export const fetchMyPrescriptions = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/prescriptions/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch prescriptions");
  return res.json();
};

export const createPrescription = async (data) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create prescription");
  return res.json();
};
