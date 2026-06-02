import axiosClient from "../lib/axiosClient.js";

export const fetchMyConsultations = async ({ page = 1, limit = 10 } = {}) => {
  return axiosClient.get("/consultations/my", {
    params: { page, limit }
  });
};


export const createConsultation = async (data) => {
  return axiosClient.post("/consultations", data);
};
