import axiosClient from "../lib/axiosClient.js";

export const fetchDoctors = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialty && filters.specialty !== "All") params.set("specialty", filters.specialty);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.maxFee) params.set("maxFee", filters.maxFee);
  if (filters.availableToday) params.set("availableToday", "true");
  if (filters.availableThisWeek) params.set("availableThisWeek", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  return axiosClient.get(`/doctors?${params.toString()}`);
};

export const fetchDoctorById = async (id) => {
  return axiosClient.get(`/doctors/${id}`);
};

export const updateDoctorStatus = async (id, isOnline) => {
  return axiosClient.patch(`/doctors/${id}/status`, { isOnline });
};

export const syncDoctorProfile = async () => {
  return axiosClient.post("/doctors/sync");
};

export const fetchDoctorDashboardData = async () => {
  return axiosClient.get("/doctors/my/dashboard");
};

export const updateDoctorProfile = async (data) => {
  return axiosClient.patch("/doctors/my/profile", data);
};

export const updateDoctorAvailability = async (workingHours) => {
  return axiosClient.patch("/doctors/my/availability", { workingHours });
};
