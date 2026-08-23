import { useState } from "react";

import { Telemetry } from "@/screens/Telemetry";
import { FormGuard } from "@/screens/FormGuard";
import { DataLab } from "@/screens/DataLab";

type Tab = "telemetry" | "formguard" | "datalab";

const TABS: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
  {
    id: "telemetry",
    label: "TELEMETRY",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
      </svg>
    ),
  },
  {
    id: "formguard",
    label: "FORM GUARD",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "datalab",
    label: "DATA LAB",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
      </svg>
    ),
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("telemetry");

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-4 pb-4 pt-6">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[13px] font-bold tracking-[0.35em] text-bio-emerald">BIOSIGNAL AI</h1>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-slate-500">
            ESP32 WEARABLE SUIT · WEB DEMO
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
          <span className="text-[9px] font-bold tracking-[0.18em] text-bio-emerald">LIVE</span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {tab === "telemetry" && <Telemetry />}
        {tab === "formguard" && <FormGuard />}
        {tab === "datalab" && <DataLab />}
      </main>

      <nav className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-slate-800 bg-bio-panel/80 p-1.5 backdrop-blur">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-colors ${
                active ? "bg-emerald-400/10 text-bio-emerald" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.icon}
              <span className="text-[8px] font-bold tracking-[0.18em]">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
