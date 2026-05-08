import { useState, useEffect } from 'react';

const useCountdown = (initialSeconds, active) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
    setIsFinished(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!active) return;

    if (secondsRemaining <= 0) {
      setIsFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, secondsRemaining]);

  return { secondsRemaining, isFinished };
};

export default useCountdown;
