export interface EmgFrame {
  t: number;
  emg: number;
  channels: number[];
  hr: number;
}

export type Zone = "under" | "optimal" | "caution" | "danger";

export const THRESHOLDS = {
  under: 35,
  optimalCeiling: 80,
  risk: 85,
} as const;

export function classifyZone(emg: number): Zone {
  if (emg < THRESHOLDS.under) return "under";
  if (emg <= THRESHOLDS.optimalCeiling) return "optimal";
  if (emg > THRESHOLDS.risk) return "danger";
  return "caution";
}

export const ZONES: Record<Zone, { label: string; color: string; glyph: string; coach: string }> = {
  under: {
    label: "UNDER-ACTIVATING",
    color: "#FBBF24",
    glyph: "!",
    coach: "Squeeze harder - push above 35% activation",
  },
  optimal: {
    label: "OPTIMAL ZONE",
    color: "#34D399",
    glyph: "\u2713",
    coach: "Locked in. Hold this contraction.",
  },
  caution: {
    label: "HIGH LOAD",
    color: "#22D3EE",
    glyph: "~",
    coach: "Approaching limit - ease off slightly.",
  },
  danger: {
    label: "INJURY RISK",
    color: "#F87171",
    glyph: "\u2715",
    coach: "Over-exertion! Reduce load immediately.",
  },
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const ema = (prev: number, next: number, a: number) => prev + (next - prev) * a;

/** kcal per 100ms tick - EMG mechanical work blended with cardiac load (~5 kcal/min at 50% / 120bpm). */
export function caloriesPerTick(emgPct: number, hrBpm: number): number {
  return (emgPct / 100) * 0.00013 + (Math.max(0, hrBpm - 90) / 90) * 0.00006;
}

/** Peak-interval regularity score 0..100 for stride/rep consistency. */
export function strideConsistencyScore(frames: EmgFrame[]): number | null {
  if (frames.length < 40) return null;
  const intervals: number[] = [];
  let lastPeak = -Infinity;
  for (let i = 1; i < frames.length - 1; i++) {
    const f = frames[i];
    if (
      f.emg >= 45 &&
      f.emg >= frames[i - 1].emg &&
      f.emg > frames[i + 1].emg &&
      f.t - lastPeak > 350
    ) {
      if (lastPeak > -Infinity) intervals.push(f.t - lastPeak);
      lastPeak = f.t;
    }
  }
  if (intervals.length < 4) return null;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean <= 0) return null;
  const variance = intervals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / intervals.length;
  return clamp(Math.round((1 - Math.sqrt(variance) / mean) * 100), 0, 100);
}

export function fmtClock(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
