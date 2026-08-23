import { useEffect, useState } from "react";

import { sensor } from "@/engine/sensor";
import type { EmgFrame } from "@/engine/core";

export function useFrame(): EmgFrame | null {
  const [frame, setFrame] = useState<EmgFrame | null>(sensor.latest);
  useEffect(() => sensor.subscribe(setFrame), []);
  return frame;
}

export function useBiometrics() {
  const [snap, setSnap] = useState({
    strain: sensor.strain,
    calories: sensor.calories,
    totalFrames: sensor.totalFrames,
    sessionStartedAt: sensor.sessionStartedAt,
  });
  useEffect(
    () =>
      sensor.subscribe(() =>
        setSnap({
          strain: sensor.strain,
          calories: sensor.calories,
          totalFrames: sensor.totalFrames,
          sessionStartedAt: sensor.sessionStartedAt,
        })
      ),
    []
  );
  return snap;
}

export function useNow(intervalMs = 500): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
