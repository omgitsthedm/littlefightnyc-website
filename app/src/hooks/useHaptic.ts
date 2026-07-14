import { useCallback } from "react";

export function useHaptic(pattern: number | number[] = 10) {
  return useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration is progressive enhancement; ignore errors.
    }
  }, [pattern]);
}
