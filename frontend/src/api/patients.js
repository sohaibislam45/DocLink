import axiosClient from "../lib/axiosClient.js";

export const fetchPatientProfile = async () => {
  return axiosClient.get("/patients/me");
};

export const createOrFetchPatient = async (userData) => {
  return axiosClient.post("/patients", userData);
};

export const updatePatientProfile = async (data) => {
  return axiosClient.patch("/patients/me", data);
};

export const fetchPatients = async ({ page = 1, limit = 10 } = {}) => {
  return axiosClient.get("/doctors/my/patients", {
    params: { page, limit }
  });
};


export const fetchPatientStats = async () => {
  return axiosClient.get("/patients/stats");
};

export const deletePatientAccount = async () => {
  return axiosClient.delete("/patients/me");
};
