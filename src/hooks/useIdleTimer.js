import { useEffect, useRef } from 'react';

export function useIdleTimer(timeoutMs = 900000, onTimeout) {
  const timerRef = useRef();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onTimeout) {
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [timeoutMs, onTimeout]);
}
