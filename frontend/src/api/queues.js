import axiosClient from "../lib/axiosClient.js";

export const fetchActiveQueue = async (doctorId) => {
  return axiosClient.get(`/queues/${doctorId}`);
};

export const joinQueue = async ({ doctorId, patientName, reason }) => {
  return axiosClient.post("/queues/join", { doctorId, patientName, reason });
};

export const leaveQueue = async () => {
  return axiosClient.delete("/queues/leave");
};

export const fetchMyQueueEntry = async () => {
  return axiosClient.get("/queues/my-entry");
};
