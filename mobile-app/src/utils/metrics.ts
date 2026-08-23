import { classifyZone, THRESHOLDS, type Zone } from "@/theme";

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const ema = (prev: number, next: number, alpha: number): number =>
  prev + (next - prev) * alpha;

/**
 * kcal burned during one 100ms tick.
 * Blend of EMG mechanical work and HR cardiac load, tuned so a moderate
 * session (~50% avg activation, ~120 bpm) burns roughly 5 kcal/min.
 */
export function caloriesPerTick(emgPct: number, hrBpm: number): number {
  const emgWork = (emgPct / 100) * 0.00013;
  const hrLoad = (Math.max(0, hrBpm - 90) / 90) * 0.00006;
  return emgWork + hrLoad;
}

export interface PeakIntervalFrame {
  t: number;
  emg: number;
}

/**
 * Stride / rep consistency score 0..100.
 * Detects EMG contraction peaks, then measures how regular the peak-to-peak
 * intervals are (1 - coefficient of variation). Needs >= 4 intervals.
 */
export function strideConsistencyScore(frames: PeakIntervalFrame[]): number | null {
  if (frames.length < 40) return null;
  const threshold = 45;
  const minGapMs = 350;
  const intervals: number[] = [];
  let lastPeakAt = -Infinity;
  for (let i = 1; i < frames.length - 1; i++) {
    const f = frames[i];
    if (
      f.emg >= threshold &&
      f.emg >= frames[i - 1].emg &&
      f.emg > frames[i + 1].emg &&
      f.t - lastPeakAt > minGapMs
    ) {
      if (lastPeakAt > -Infinity) intervals.push(f.t - lastPeakAt);
      lastPeakAt = f.t;
    }
  }
  if (intervals.length < 4) return null;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean <= 0) return null;
  const variance =
    intervals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / intervals.length;
  const cv = Math.sqrt(variance) / mean;
  return clamp(Math.round((1 - cv) * 100), 0, 100);
}

export function zoneOf(emg: number): Zone {
  return classifyZone(emg);
}

export function isAboveInjuryRisk(emg: number): boolean {
  return emg > THRESHOLDS.injuryRisk;
}
