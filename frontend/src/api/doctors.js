const BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchDoctors = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialty && filters.specialty !== "All") params.set("specialty", filters.specialty);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.maxFee) params.set("maxFee", filters.maxFee);
  if (filters.availableToday) params.set("availableToday", "true");
  if (filters.availableThisWeek) params.set("availableThisWeek", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  const res = await fetch(`${BASE}/api/doctors?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch doctors");
  return res.json();
};

export const fetchDoctorById = async (id) => {
  const res = await fetch(`${BASE}/api/doctors/${id}`);
  if (!res.ok) throw new Error("Doctor not found");
  return res.json();
};

export const updateDoctorStatus = async (id, isOnline) => {
  const res = await fetch(`${BASE}/api/doctors/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isOnline }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};
