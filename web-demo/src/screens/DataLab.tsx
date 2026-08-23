import { useEffect, useRef, useState } from "react";

import { Waveform } from "@/components/Waveform";
import { Panel } from "@/components/ui";
import { sensor } from "@/engine/sensor";
import { fmtClock, strideConsistencyScore, type EmgFrame } from "@/engine/core";

type Status = "idle" | "recording" | "paused" | "stopped";

const STATUS_STYLE: Record<Status, { t: string; c: string }> = {
  idle: { t: "IDLE", c: "#64748B" },
  recording: { t: "\u25CF REC", c: "#F87171" },
  paused: { t: "\u2016 PAUSED", c: "#FBBF24" },
  stopped: { t: "\u2713 SAVED", c: "#34D399" },
};

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataLab() {
  const [status, setStatus] = useState<Status>("idle");
  const [points, setPoints] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [strideScore, setStrideScore] = useState<number | null>(null);

  const framesRef = useRef<EmgFrame[]>([]);
  const segmentStartRef = useRef(0);
  const activeMsRef = useRef(0);

  useEffect(() => {
    if (status !== "recording") return;
    const unsub = sensor.subscribe((f) => framesRef.current.push(f));
    return unsub;
  }, [status]);

  useEffect(() => {
    if (status !== "recording" && status !== "paused") return;
    const uiTimer = setInterval(() => {
      setPoints(framesRef.current.length);
      setElapsedMs(activeMsRef.current + Date.now() - segmentStartRef.current);
    }, 250);
    const strideTimer =
      status === "recording"
        ? setInterval(() => setStrideScore(strideConsistencyScore(framesRef.current.slice(-1200))), 1500)
        : null;
    return () => {
      clearInterval(uiTimer);
      if (strideTimer) clearInterval(strideTimer);
    };
  }, [status]);

  const start = () => {
    framesRef.current = [];
    activeMsRef.current = 0;
    segmentStartRef.current = Date.now();
    setPoints(0);
    setElapsedMs(0);
    setStrideScore(null);
    setStatus("recording");
  };
  const pause = () => {
    if (status !== "recording") return;
    activeMsRef.current += Date.now() - segmentStartRef.current;
    setStatus("paused");
  };
  const resume = () => {
    if (status !== "paused") return;
    segmentStartRef.current = Date.now();
    setStatus("recording");
  };
  const stop = () => {
    if (status === "recording") activeMsRef.current += Date.now() - segmentStartRef.current;
    setElapsedMs(activeMsRef.current);
    setStatus(status === "idle" ? status : "stopped");
  };
  const reset = () => {
    framesRef.current = [];
    setPoints(0);
    setElapsedMs(0);
    setStrideScore(null);
    setStatus("idle");
  };

  const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const exportJson = () => {
    if (!framesRef.current.length) return;
    const session = {
      format: "biosignal-ai/session@1",
      meta: {
        source: "web-demo",
        startedAtIso: new Date(Date.now() - elapsedMs).toISOString(),
        durationMs: elapsedMs,
        sampleRateHz: 10,
        points: framesRef.current.length,
        strideConsistency: strideScore,
        note: "EMG normalized 0-100 per channel; exoskeleton model-training telemetry.",
      },
      frames: framesRef.current,
    };
    download(`biosignal-${stamp()}.json`, JSON.stringify(session), "application/json");
  };

  const exportCsv = () => {
    if (!framesRef.current.length) return;
    const chCount = framesRef.current.reduce((m, f) => Math.max(m, f.channels.length), 1);
    const header =
      ["t_ms", "t_iso", "emg_pct", "hr_bpm"] +
      Array.from({ length: chCount }, (_, i) => `ch${i + 1}_pct`).join(",");
    const rows = framesRef.current.map((f) =>
      [
        f.t,
        new Date(f.t).toISOString(),
        f.emg.toFixed(2),
        f.hr,
        ...Array.from({ length: chCount }, (_, i) => (i < f.channels.length ? f.channels[i].toFixed(2) : "")),
      ].join(",")
    );
    download(`biosignal-${stamp()}.csv`, [header, ...rows].join("\n"), "text/csv");
  };

  const hasData = points > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="ELAPSED" value={fmtClock(elapsedMs)} accent="#22D3EE" />
        <Tile label="DATA POINTS" value={points.toLocaleString()} accent="#34D399" />
        <Tile label="SAMPLE RATE" value="10 Hz" accent="#FB7185" />
        <Tile
          label="STRIDE CONSISTENCY"
          value={strideScore === null ? "--" : `${strideScore}%`}
          accent="#FBBF24"
          footer="peak interval regularity"
        />
      </div>

      <Panel className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.22em] text-slate-300">RECORDING MONITOR</span>
          <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: STATUS_STYLE[status].c }}>
            {STATUS_STYLE[status].t}
          </span>
        </div>
        <Waveform height={150} />
      </Panel>

      <Panel className="flex flex-col gap-3 p-4">
        <div className="text-[11px] font-bold tracking-[0.22em] text-slate-300">TELEMETRY RECORDING</div>

        <div className="flex flex-wrap gap-2">
          {status === "recording" ? (
            <Btn onClick={pause} color="#22D3EE">PAUSE</Btn>
          ) : (
            <Btn onClick={status === "paused" ? resume : start} color="#34D399">
              {status === "paused" ? "RESUME" : status === "stopped" ? "RESTART" : "START TELEMETRY RECORDING"}
            </Btn>
          )}
          <Btn onClick={stop} color="#F87171" disabled={status !== "recording" && status !== "paused"}>
            STOP
          </Btn>
        </div>

        <div className="flex flex-wrap gap-2">
          <Btn onClick={exportJson} color="#22D3EE" disabled={!hasData}>EXPORT JSON</Btn>
          <Btn onClick={exportCsv} color="#22D3EE" disabled={!hasData}>EXPORT CSV</Btn>
          <Btn onClick={reset} color="#64748B" disabled={!hasData && status === "idle"}>CLEAR SESSION DATA</Btn>
        </div>

        <p className="text-[10px] leading-4 text-slate-600">
          Frames buffer locally and export as a versioned session bundle (JSON) or flat table (CSV)
          ready for model-training pipelines.
        </p>
      </Panel>
    </div>
  );
}

function Tile({ label, value, accent, footer }: { label: string; value: string; accent: string; footer?: string }) {
  return (
    <Panel className="p-3">
      <div className="text-[9px] font-semibold tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-1.5 font-mono text-lg font-bold" style={{ color: accent }}>
        {value}
      </div>
      {footer && <div className="text-[9px] text-slate-600">{footer}</div>}
    </Panel>
  );
}

function Btn({
  children,
  onClick,
  color,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] transition-all hover:brightness-125 active:scale-95 ${
        disabled ? "cursor-not-allowed opacity-35" : ""
      }`}
      style={{
        borderColor: `${color}55`,
        backgroundColor: `${color}0D`,
        color,
        boxShadow: `0 0 16px ${color}22`,
      }}
    >
      {children}
    </button>
  );
}
