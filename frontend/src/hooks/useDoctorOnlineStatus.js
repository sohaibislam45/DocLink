import { useState, useEffect, useCallback } from "react";
import axiosClient from "../lib/axiosClient";
import { useQueryClient } from "@tanstack/react-query";

const LS_KEY = "doclink_doctor_online";
const EVENT_NAME = "doctor-online-change";

const useDoctorOnlineStatus = () => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem(LS_KEY);
    return stored === null ? true : stored === "true";
  });

  // Fetch initial state from database
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axiosClient.get("/doctors/my/dashboard");
        const doc = response?.doctor;
        if (doc && doc.isOnline !== undefined) {
          setIsOnline(doc.isOnline);
          localStorage.setItem(LS_KEY, String(doc.isOnline));
        }
      } catch (err) {
        console.error("Failed to fetch initial online status:", err);
      }
    };
    fetchStatus();
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleChange = (e) => {
      setIsOnline(e.detail.isOnline);
    };
    window.addEventListener(EVENT_NAME, handleChange);
    return () => window.removeEventListener(EVENT_NAME, handleChange);
  }, []);

  const toggleOnline = useCallback(async () => {
    const next = !isOnline;
    setIsOnline(next);
    localStorage.setItem(LS_KEY, String(next));
    // Notify all other listeners
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { isOnline: next } }));

    // Persist to database & refresh query cache
    try {
      await axiosClient.patch("/doctors/my/profile", { isOnline: next });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    } catch (err) {
      console.error("Failed to persist online status to database:", err);
    }
  }, [isOnline, queryClient]);

  return { isOnline, toggleOnline };
};

export default useDoctorOnlineStatus;
