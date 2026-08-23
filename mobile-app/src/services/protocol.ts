import type { EmgFrame } from "@/types/signal";

/**
 * ESP32 firmware contract (Nordic UART TX characteristic / WebSocket text):
 *
 *   {"emg":[62.4,58.1,70.2,55.0],"hr":118}
 *   {"emg":62.4,"hr":118}
 *   E:62.4,H:118
 *
 * Lines are newline-delimited. Anything unparseable returns null and is skipped.
 */
export function parseEsp32Payload(raw: string, now: number): EmgFrame | null {
  const text = raw.trim();
  if (!text) return null;

  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text) as { emg?: unknown; hr?: unknown };
      const hr = typeof obj.hr === "number" ? clampHr(obj.hr) : 0;
      let channels: number[] = [];
      let emg = 0;
      if (Array.isArray(obj.emg)) {
        channels = obj.emg.map((v) => clampPct(Number(v)));
        emg = channels.reduce((a, b) => a + b, 0) / channels.length;
      } else if (typeof obj.emg === "number") {
        emg = clampPct(obj.emg);
      } else {
        return null;
      }
      return { t: now, emg, channels, hr };
    } catch {
      return null;
    }
  }

  const match = /^E\s*:\s*([\d.]+)\s*,\s*H\s*:\s*([\d.]+)$/i.exec(text);
  if (match) {
    const emg = clampPct(parseFloat(match[1]));
    const hr = clampHr(parseFloat(match[2]));
    return { t: now, emg, channels: [emg], hr };
  }

  return null;
}

const clampPct = (v: number): number => (Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0);
const clampHr = (v: number): number => (Number.isFinite(v) ? Math.min(230, Math.max(30, v)) : 0);

export function splitLines(buffer: string): { complete: string[]; rest: string } {
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  return { complete: parts.filter((l) => l.trim().length > 0), rest };
}
