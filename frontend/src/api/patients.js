import { auth } from "../lib/firebase.js";

const BASE = import.meta.env.VITE_API_BASE_URL;

const getToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");
  return token;
};

export const fetchPatientProfile = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/patients/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export const createOrFetchPatient = async (userData) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to create patient");
  return res.json();
};

export const updatePatientProfile = async (data) => {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/patients/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};

export const fetchPatients = async () => {
  const res = await fetch(`${BASE}/api/consultations/my`); // Temporary mapping to history
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
};
