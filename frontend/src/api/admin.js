import axiosClient from "../lib/axiosClient.js";

// Stats
export const fetchAdminStats = async () => {
  return axiosClient.get("/admin/stats");
};

// Doctors
export const fetchAdminDoctors = async (params) => {
  return axiosClient.get("/admin/doctors", { params });
};

export const addDoctor = async (data) => {
  return axiosClient.post("/admin/doctors", data);
};

export const updateDoctor = async (id, data) => {
  return axiosClient.patch(`/admin/doctors/${id}`, data);
};

export const deleteDoctor = async (id) => {
  return axiosClient.delete(`/admin/doctors/${id}`);
};

export const verifyDoctor = async (id) => {
  return axiosClient.patch(`/admin/doctors/${id}/verify`);
};

// Patients
export const fetchAdminPatients = async (params) => {
  return axiosClient.get("/admin/patients", { params });
};

export const updatePatient = async (uid, data) => {
  return axiosClient.patch(`/admin/patients/${uid}`, data);
};

export const deletePatient = async (uid) => {
  return axiosClient.delete(`/admin/patients/${uid}`);
};

// Payments
export const fetchAdminPayments = async (params) => {
  return axiosClient.get("/admin/payments", { params });
};

// Settings
export const fetchSettings = async () => {
  return axiosClient.get("/admin/settings");
};

export const updateSettings = async (data) => {
  return axiosClient.patch("/admin/settings", data);
};

// Public Settings
export const fetchPublicSettings = async () => {
  return axiosClient.get("/admin/public-settings");
};
