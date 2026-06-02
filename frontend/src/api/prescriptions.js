import axiosClient from "../lib/axiosClient.js";

export const fetchMyPrescriptions = async ({ page = 1, limit = 10 } = {}) => {
  return axiosClient.get("/prescriptions/my", {
    params: { page, limit }
  });
};


export const createPrescription = async (data) => {
  return axiosClient.post("/prescriptions", data);
};
