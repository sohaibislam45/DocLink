import axiosClient from "../lib/axiosClient.js";

export const createRoom = async ({ doctorId, patientUid }) => {
  return axiosClient.post("/rooms/create", { doctorId, patientUid });
  // returns { roomId, roomName, roomUrl }
};

export const getMeetingToken = async ({ roomName, isOwner }) => {
  return axiosClient.post("/rooms/token", { roomName, isOwner });
  // returns { token }
};

export const fetchRoom = async (roomId) => {
  return axiosClient.get(`/rooms/${roomId}`);
};

export const endRoom = async (roomId) => {
  return axiosClient.patch(`/rooms/${roomId}/end`);
};
