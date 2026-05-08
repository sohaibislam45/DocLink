import { useState, useEffect, useCallback, useRef } from "react";

const useConsultationTimer = (active) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  const formattedTime = (() => {
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  })();

  return { elapsed, formattedTime, reset };
};

export default useConsultationTimer;
