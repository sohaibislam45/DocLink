import axiosClient from "../lib/axiosClient.js";

export const fetchMyPrescriptions = async () => {
  return axiosClient.get("/prescriptions/my");
};

export const createPrescription = async (data) => {
  return axiosClient.post("/prescriptions", data);
};
