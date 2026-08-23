import { useEffect, useState } from "react";

import { ZONES, type Zone } from "@/engine/core";

export function FeedbackBadge({ zone }: { zone: Zone }) {
  const s = ZONES[zone];
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(zone === "danger");
  }, [zone]);

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border px-6 py-3 backdrop-blur-sm transition-transform ${
        pulse ? "animate-[pulseDot_0.42s_ease-in-out_infinite_alternate]" : ""
      }`}
      style={{
        borderColor: s.color,
        backgroundColor: `${s.color}14`,
        boxShadow: `0 0 24px ${s.color}${pulse ? "66" : "33"}`,
        transform: pulse ? "scale(1.04)" : "scale(1)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: `${s.color}22`, color: s.color }}
        >
          {s.glyph}
        </span>
        <span className="text-[13px] font-bold tracking-[0.16em]" style={{ color: s.color }}>
          {s.label}
        </span>
      </div>
      <span className="mt-1 text-[11px] text-slate-400">{s.coach}</span>
    </div>
  );
}
