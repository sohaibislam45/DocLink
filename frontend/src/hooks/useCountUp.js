import { useState, useEffect } from 'react';

export const useCountUp = (target, duration = 2000, start = 0, decimals = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime = null;
    let animationFrame = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const currentVal = start + (target - start) * percentage;
      setCount(currentVal);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, start]);

  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count);
};
