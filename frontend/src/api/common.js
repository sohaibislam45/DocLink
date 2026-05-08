import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").endsWith('/api') 
  ? import.meta.env.VITE_API_BASE_URL 
  : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api`;

export const fetchSpecialties = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/specialties`);
    return response.data;
  } catch (err) {
    console.error("Error fetching specialties:", err);
    return [];
  }
};

export const fetchTestimonials = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/testimonials`);
    return response.data;
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};
