import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { fmtStamp } from "@/utils/format";
import type { EmgFrame } from "@/types/signal";

export interface SessionMeta {
  source: string;
  exercise: string;
  startedAt: number;
  durationMs: number;
  sampleRateHz: number;
  strideScore: number | null;
}

const buildSession = (meta: SessionMeta, frames: EmgFrame[]) => ({
  format: "biosignal-ai/session@1",
  meta: {
    ...meta,
    startedAtIso: new Date(meta.startedAt).toISOString(),
    points: frames.length,
    note: "EMG intensity is normalized 0-100 per channel. Intended for exoskeleton model training."
  },
  frames
});

function toCsv(frames: EmgFrame[]): string {
  const channelCount = frames.reduce((m, f) => Math.max(m, f.channels.length), 1);
  const header =
    ["t_ms", "t_iso", "emg_pct", "hr_bpm"] +
    Array.from({ length: channelCount }, (_, i) => `ch${i + 1}_pct`).join(",");
  const rows = frames.map((f) => {
    const base = [f.t, new Date(f.t).toISOString(), f.emg.toFixed(2), f.hr];
    const chans = Array.from({ length: channelCount }, (_, i) =>
      i < f.channels.length ? f.channels[i].toFixed(2) : ""
    );
    return [...base, ...chans].join(",");
  });
  return [header, ...rows].join("\n");
}

async function shareFile(path: string, mimeType: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error("Sharing is not available on this device");
  await Sharing.shareAsync(path, { mimeType, UTI: "public.data" });
}

function cacheDir(): string {
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error("Cache directory is unavailable on this device");
  return dir;
}

export async function exportJson(
  meta: SessionMeta,
  frames: EmgFrame[]
): Promise<void> {
  const path = `${cacheDir()}biosignal-${fmtStamp(new Date(meta.startedAt))}.json`;
  await FileSystem.writeAsStringAsync(
    path,
    JSON.stringify(buildSession(meta, frames)),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
  await shareFile(path, "application/json");
}

export async function exportCsv(
  meta: SessionMeta,
  frames: EmgFrame[]
): Promise<void> {
  const path = `${cacheDir()}biosignal-${fmtStamp(new Date(meta.startedAt))}.csv`;
  await FileSystem.writeAsStringAsync(path, toCsv(frames), {
    encoding: FileSystem.EncodingType.UTF8
  });
  await shareFile(path, "text/csv");
}

export function guardExport(fn: () => Promise<void>): void {
  fn().catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    Alert.alert("Export failed", msg);
  });
}
