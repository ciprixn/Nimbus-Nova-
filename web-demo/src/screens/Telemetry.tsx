import { useRef } from "react";

import { Waveform } from "@/components/Waveform";
import { Card, Panel } from "@/components/ui";
import { useBiometrics, useFrame, useNow } from "@/hooks/useSensor";
import { fmtClock } from "@/engine/core";

function PulseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
    </svg>
  );
}

export function Telemetry() {
  const frame = useFrame();
  const { strain, calories, totalFrames } = useBiometrics();
  const now = useNow(500);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
            LIVE EMG WAVEFORM
          </span>
          <span className="font-mono text-[10px] text-slate-600">10 Hz · 24 s window</span>
        </div>
        <Waveform height={230} />
        <div className="mt-3 flex items-center justify-end gap-4 text-[9px] tracking-widest text-slate-500">
          <Dot color="#FBBF24" label="<35 UNDER" />
          <Dot color="#34D399" label="OPTIMAL" />
          <Dot color="#F87171" label=">85 RISK" />
        </div>
      </Panel>

      <div className="flex gap-3">
        <Card
          label="HEART RATE"
          value={frame ? String(frame.hr) : "--"}
          unit="BPM"
          accent="#FB7185"
          footer="PPG channel"
        />
        <Card
          label="MUSCLE STRAIN"
          value={strain.toFixed(1)}
          unit="%"
          accent="#22D3EE"
          footer="EMA-smoothed load"
        />
      </div>

      <div className="flex gap-3">
        <Card
          label="CALORIES"
          value={calories.toFixed(2)}
          unit="kcal"
          accent="#FBBF24"
          footer="EMG work + HR model"
        />
        <Card
          label="SESSION"
          value={fmtClock(now - (useSessionStart()))}
          accent="#34D399"
          footer={`${totalFrames.toLocaleString()} frames @10Hz`}
        />
      </div>

      <Panel className="p-4">
        <div className="text-[11px] font-bold tracking-[0.22em] text-slate-300">SIGNAL SOURCE</div>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-3 py-2.5">
          <PulseIcon className="h-4 w-4 text-bio-emerald" />
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-bio-emerald">
              STREAMING · DEMO GENERATOR
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">
              Synthetic sinusoidal + spike model at 100ms ticks (web build)
            </div>
          </div>
          <span className="ml-auto h-2 w-2 animate-pulse-dot rounded-full bg-bio-emerald" />
        </div>
        <p className="mt-3 text-[10px] leading-4 text-slate-600">
          Mobile build adds ESP32 transports: BLE Nordic UART (6E400001...) and WebSocket
          newline-delimited JSON {"{emg:[...],hr:n}"}, e.g. ws://192.168.4.1:81/
        </p>
      </Panel>
    </div>
  );
}

let sessionStart = Date.now();
function useSessionStart() {
  const ref = useRef(sessionStart);
  return ref.current;
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
