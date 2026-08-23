import { useEffect, useRef, useState } from "react";

import { FeedbackBadge } from "@/components/FeedbackBadge";
import { Gauge } from "@/components/Gauge";
import { useFrame } from "@/hooks/useSensor";
import { classifyZone, type Zone } from "@/engine/core";

const EXERCISES = ["BICEP CURL", "SQUAT", "DEADLIFT"] as const;
type Exercise = (typeof EXERCISES)[number];

export function FormGuard() {
  const frame = useFrame();
  const emg = frame?.emg ?? 0;
  const zone: Zone = classifyZone(emg);

  const [exercise, setExercise] = useState<Exercise>("BICEP CURL");
  const [reps, setReps] = useState(0);
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const armedRef = useRef(true);
  useEffect(() => {
    if (emg < 40) armedRef.current = true;
    else if (armedRef.current && emg > 70) {
      armedRef.current = false;
      setReps((r) => r + 1);
    }
  }, [emg]);

  useEffect(() => {
    setReps(0);
    armedRef.current = true;
  }, [exercise]);

  useEffect(() => {
    if (!camOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    let cancelled = false;
    const md = navigator.mediaDevices;
    if (!md) {
      setCamError("This browser does not expose camera access (needs HTTPS or localhost).");
      setCamOn(false);
      return;
    }
    md.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setCamError("Camera unavailable or permission denied - EMG overlay still runs.");
        setCamOn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [camOn]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-black">
      {camOn ? (
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0B1220_0%,#020617_70%)]" />
      )}

      {zone === "danger" && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl border-[3px] border-bio-red/80" />
      )}

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between p-4">
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-bio-emerald">AI FORM GUARD</div>
            <div className="mt-1 font-mono text-[10px] text-slate-400">TARGET · {exercise}</div>
          </div>
          <Gauge value={emg} size={104} />
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <FeedbackBadge zone={zone} />
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/80 px-4 py-2.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">REPS DETECTED</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setReps(0);
                  armedRef.current = true;
                }}
                className="text-[9px] font-bold tracking-widest text-slate-500 hover:text-slate-300"
              >
                RESET
              </button>
              <span className="font-mono text-lg font-bold text-bio-emerald">{reps}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {EXERCISES.map((ex) => {
              const active = ex === exercise;
              return (
                <button
                  key={ex}
                  onClick={() => setExercise(ex)}
                  className={`flex-1 rounded-lg border py-2 text-[9px] font-bold tracking-widest transition-colors ${
                    active
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-700 bg-slate-950/80 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {ex}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => !camError && setCamOn((v) => !v)}
            className={`rounded-xl border py-2.5 text-[11px] font-bold tracking-[0.18em] transition-colors ${
              camOn
                ? "border-red-400/50 bg-red-400/10 text-red-300"
                : "border-emerald-400/50 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
            } ${camError ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {camOn ? "STOP CAMERA" : "ENABLE CAMERA OVERLAY"}
          </button>
          {camError && <p className="text-center text-[10px] text-slate-500">{camError}</p>}
        </div>
      </div>
    </div>
  );
}
