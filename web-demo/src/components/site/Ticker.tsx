import { useEffect, useState } from "react";

import { sensor } from "@/engine/sensor";
import type { EmgFrame } from "@/engine/core";

const STATIC_ITEMS = ["4× EMG CHANNELS", "PPG HEART RATE", "10 HZ SAMPLE RATE", "BLE · NORDIC UART", "WIFI · WEBSOCKET", "JSON / CSV EXPORT"];

/** Live telemetry ticker - the page's single marquee, motivated by the live-feed product. */
export function Ticker() {
  const [frame, setFrame] = useState<EmgFrame | null>(sensor.latest);

  useEffect(() => sensor.subscribe(setFrame), []);

  const live = frame
    ? [
        `EMG ${frame.emg.toFixed(1)}%`,
        `HR ${frame.hr} BPM`,
        ...frame.channels.slice(0, 2).map((c, i) => `CH${i + 1} ${c.toFixed(1)}%`),
      ]
    : [];

  const items = [...live, ...STATIC_ITEMS];

  return (
    <div className="overflow-hidden border-y border-zinc-800/80 bg-bio-panel/40 py-3">
      <div
        className="flex w-max gap-10 whitespace-nowrap"
        style={{ animation: "tickerScroll 36s linear infinite" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-10" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-10 font-mono text-[11px] tracking-[0.18em] text-zinc-500">
                {item}
                <span className="h-1 w-1 rounded-full bg-emerald-400/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
