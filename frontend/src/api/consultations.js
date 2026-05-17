import axiosClient from "../lib/axiosClient.js";

export const fetchMyConsultations = async () => {
  return axiosClient.get("/consultations/my");
};

export const createConsultation = async (data) => {
  return axiosClient.post("/consultations", data);
};
