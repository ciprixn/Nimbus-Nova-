import { useCallback, useEffect, useRef, useState } from "react";

import { SensorService } from "@/services/SensorService";
import { strideConsistencyScore } from "@/utils/metrics";
import type { EmgFrame } from "@/types/signal";

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped";

interface RecorderState {
  status: RecorderStatus;
  pointCount: number;
  elapsedMs: number;
  strideScore: number | null;
}

const STRIDE_WINDOW_MS = 30000;

/**
 * High-frequency telemetry recorder. Frames land in a plain ref array (no
 * re-renders per sample); React state is synced at low frequency for UI.
 */
export function useRecorder(): RecorderState & {
  framesRef: React.MutableRefObject<EmgFrame[]>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
} {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [pointCount, setPointCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [strideScore, setStrideScore] = useState<number | null>(null);

  const framesRef = useRef<EmgFrame[]>([]);
  const segmentStartRef = useRef<number>(0);
  const activeMsRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    const unsub = SensorService.onFrame((f) => {
      if (status === "recording") framesRef.current.push(f);
    });
    return unsub;
  }, [status]);

  useEffect(() => {
    if (status !== "recording" && status !== "paused") return;
    const uiTimer = setInterval(() => {
      setPointCount(framesRef.current.length);
      setElapsedMs(activeMsRef.current + (Date.now() - segmentStartRef.current));
    }, 250);

    const strideTimer =
      status === "recording"
        ? setInterval(() => {
            const now = Date.now();
            const window = framesRef.current.filter((f) => now - f.t <= STRIDE_WINDOW_MS * 2);
            setStrideScore(strideConsistencyScore(window));
          }, 1500)
        : null;

    return () => {
      clearInterval(uiTimer);
      if (strideTimer) clearInterval(strideTimer);
    };
  }, [status]);

  const start = useCallback(() => {
    framesRef.current = [];
    activeMsRef.current = 0;
    startedAtRef.current = Date.now();
    segmentStartRef.current = startedAtRef.current;
    setPointCount(0);
    setElapsedMs(0);
    setStrideScore(null);
    setStatus("recording");
  }, []);

  const pause = useCallback(() => {
    setStatus((prev) => {
      if (prev !== "recording") return prev;
      activeMsRef.current += Date.now() - segmentStartRef.current;
      return "paused";
    });
  }, []);

  const resume = useCallback(() => {
    setStatus((prev) => {
      if (prev !== "paused") return prev;
      segmentStartRef.current = Date.now();
      return "recording";
    });
  }, []);

  const stop = useCallback(() => {
    setStatus((prev) => {
      if (prev === "recording") {
        activeMsRef.current += Date.now() - segmentStartRef.current;
      }
      return prev === "idle" ? prev : "stopped";
    });
    setPointCount(framesRef.current.length);
    setElapsedMs(activeMsRef.current);
  }, []);

  const reset = useCallback(() => {
    framesRef.current = [];
    activeMsRef.current = 0;
    setPointCount(0);
    setElapsedMs(0);
    setStrideScore(null);
    setStatus("idle");
  }, []);

  return {
    status,
    pointCount,
    elapsedMs,
    strideScore,
    framesRef,
    start,
    pause,
    resume,
    stop,
    reset
  };
}
