export const COLORS = {
  void: "#020617",
  panel: "#0B1220",
  line: "#1E293B",
  emerald: "#34D399",
  cyan: "#22D3EE",
  amber: "#FBBF24",
  red: "#F87171",
  rose: "#FB7185",
  muted: "#64748B",
  text: "#E2E8F0"
} as const;

export const THRESHOLDS = {
  underActivation: 35,
  optimalCeiling: 80,
  injuryRisk: 85
} as const;

export type Zone = "under" | "optimal" | "caution" | "danger";

export function classifyZone(emg: number): Zone {
  if (emg < THRESHOLDS.underActivation) return "under";
  if (emg <= THRESHOLDS.optimalCeiling) return "optimal";
  if (emg > THRESHOLDS.injuryRisk) return "danger";
  return "caution";
}

export const ZONE_STYLE: Record<
  Zone,
  { label: string; color: string; glyph: string; coach: string }
> = {
  under: {
    label: "UNDER-ACTIVATING",
    color: "#FBBF24",
    glyph: "!",
    coach: "Squeeze harder - push above 35% activation"
  },
  optimal: {
    label: "OPTIMAL ZONE",
    color: "#34D399",
    glyph: "\u2713",
    coach: "Locked in. Hold this contraction."
  },
  caution: {
    label: "HIGH LOAD",
    color: "#22D3EE",
    coach: "Approaching limit - ease off slightly.",
    glyph: "~"
  },
  danger: {
    label: "INJURY RISK",
    color: "#F87171",
    glyph: "\u2715",
    coach: "Over-exertion! Reduce load immediately."
  }
};
