import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimeoutOptions {
  idleMinutes: number;
  warningMinutes: number; // How many minutes before logout to show warning
  onWarn: () => void;
  onLogout: () => void;
}

export function useIdleTimeout({
  idleMinutes,
  warningMinutes,
  onWarn,
  onLogout,
}: UseIdleTimeoutOptions) {
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idleMs = idleMinutes * 60 * 1000;
  const warningMs = (idleMinutes - warningMinutes) * 60 * 1000;

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warningTimer.current = setTimeout(onWarn, warningMs);
    logoutTimer.current = setTimeout(onLogout, idleMs);
  }, [clearTimers, onWarn, onLogout, warningMs, idleMs]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    const handleActivity = () => resetTimers();

    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetTimers(); // Start timers on mount

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimers();
    };
  }, [resetTimers, clearTimers]);

  return { resetTimers };
}