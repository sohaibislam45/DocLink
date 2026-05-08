import { useState, useEffect, useCallback } from "react";

const LS_KEY = "doclink_doctor_online";
const EVENT_NAME = "doctor-online-change";

const useDoctorOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem(LS_KEY);
    return stored === null ? true : stored === "true";
  });

  // Listen for changes from other components
  useEffect(() => {
    const handleChange = (e) => {
      setIsOnline(e.detail.isOnline);
    };
    window.addEventListener(EVENT_NAME, handleChange);
    return () => window.removeEventListener(EVENT_NAME, handleChange);
  }, []);

  const toggleOnline = useCallback(() => {
    setIsOnline((prev) => {
      const next = !prev;
      localStorage.setItem(LS_KEY, String(next));
      // Notify all other listeners
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { isOnline: next } }));
      return next;
    });
  }, []);

  return { isOnline, toggleOnline };
};

export default useDoctorOnlineStatus;
