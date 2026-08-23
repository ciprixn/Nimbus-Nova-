import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { SensorService } from "@/services/SensorService";
import type {
  ActivationOptions,
  Biometrics,
  ConnectionStatus,
  EmgFrame,
  SignalMode
} from "@/types/signal";

const HISTORY_CAPACITY = 600;

interface LiveValue {
  frame: EmgFrame | null;
  biometrics: Biometrics;
  /** ring of recent aggregate EMG values, mutated in place - read via ref */
  historyRef: React.MutableRefObject<number[]>;
}

interface ControlValue {
  mode: SignalMode;
  status: ConnectionStatus;
  statusMessage: string;
  totalFrames: number;
  sourceLabel: string;
  sessionStartedAt: number;
  activate: (mode: SignalMode, opts?: ActivationOptions) => Promise<void>;
  resetSession: () => void;
}

const LiveContext = createContext<LiveValue | null>(null);
const ControlContext = createContext<ControlValue | null>(null);

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [frame, setFrame] = useState<EmgFrame | null>(null);
  const [biometrics, setBiometrics] = useState<Biometrics>({
    strainIndex: 0,
    calories: 0
  });
  const [mode, setModeState] = useState<SignalMode>("mock");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [statusMessage, setStatusMessage] = useState(
    "Booting demo generator..."
  );
  const [totalFrames, setTotalFrames] = useState(0);
  const [sourceLabel, setSourceLabel] = useState("Demo Generator");
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());

  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    let mounted = true;

    const unsubFrame = SensorService.onFrame((f) => {
      if (!mounted) return;
      const hist = historyRef.current;
      hist.push(f.emg);
      if (hist.length > HISTORY_CAPACITY) hist.shift();
      setFrame(f);
      setBiometrics(SensorService.snapshotBiometrics());
    });

    const unsubStatus = SensorService.onStatus((s, m) => {
      if (!mounted) return;
      setStatus(s);
      setStatusMessage(m ?? s);
      setSourceLabel(SensorService.activeLabel);
    });

    void SensorService.activate("mock");

    const totalsTimer = setInterval(() => {
      if (!mounted) return;
      setTotalFrames(SensorService.snapshotTotals().totalFrames);
    }, 500);

    return () => {
      mounted = false;
      unsubFrame();
      unsubStatus();
      clearInterval(totalsTimer);
      SensorService.deactivate();
    };
  }, []);

  const activate = useCallback(async (next: SignalMode, opts?: ActivationOptions) => {
    setModeState(next);
    setStatus("connecting");
    setStatusMessage(next === "mock" ? "Starting demo generator..." : "Connecting...");
    await SensorService.activate(next, opts);
    setSessionStartedAt(Date.now());
    historyRef.current.length = 0;
  }, []);

  const resetSession = useCallback(() => {
    SensorService.resetSession();
    setTotalFrames(0);
    setBiometrics({ strainIndex: 0, calories: 0 });
    setSessionStartedAt(Date.now());
    historyRef.current.length = 0;
  }, []);

  const live = useMemo<LiveValue>(
    () => ({ frame, biometrics, historyRef }),
    [frame, biometrics]
  );

  const control = useMemo<ControlValue>(
    () => ({
      mode,
      status,
      statusMessage,
      totalFrames,
      sourceLabel,
      sessionStartedAt,
      activate,
      resetSession
    }),
    [
      mode,
      status,
      statusMessage,
      totalFrames,
      sourceLabel,
      sessionStartedAt,
      activate,
      resetSession
    ]
  );

  return (
    <ControlContext.Provider value={control}>
      <LiveContext.Provider value={live}>{children}</LiveContext.Provider>
    </ControlContext.Provider>
  );
}

/**
 * Real-time sensor streaming hook. Emits a new sample every 100ms while a
 * source is active (demo generator by default), plus derived biometrics.
 */
export function useEMGData(): LiveValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useEMGData must be used inside <SensorProvider>");
  return ctx;
}

/** Connection mode / transport controls. */
export function useSensorControl(): ControlValue {
  const ctx = useContext(ControlContext);
  if (!ctx) throw new Error("useSensorControl must be used inside <SensorProvider>");
  return ctx;
}
