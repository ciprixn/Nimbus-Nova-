import type { ReactNode } from "react";

import { useReveal } from "@/hooks/useReveal";

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-20">
      <div
        ref={ref}
        className={`transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-400">{eyebrow}</div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: (
      <>
        <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
      </>
    ),
    title: "Live Biomechanical Feedback",
    body: "A scrolling EMG oscilloscope, per-channel spectrum bars and an animated muscle-map HUD render at a silky 60fps on-device.",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </>
    ),
    title: "AI Form Guard",
    body: "The camera overlay classifies every rep in real time — under-activation, optimal zone, or over-exertion — with instant coaching cues.",
  },
  {
    icon: (
      <>
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
        <path d="M12 9v4M12 16h.01" />
      </>
    ),
    title: "Injury Prevention",
    body: "Hard thresholds at 35% and 85% muscle activation. Cross the red line and the whole screen pulses before anything tears.",
  },
  {
    icon: (
      <>
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </>
    ),
    title: "Training Data Pipeline",
    body: "One tap exports versioned session bundles (JSON) or flat tables (CSV) with stride-consistency scores — shaped for ML ingestion.",
  },
  {
    icon: (
      <>
        <path d="M5 12a7 7 0 0114 0M8.5 12a3.5 3.5 0 017 0" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <path d="M2 20h20" />
      </>
    ),
    title: "Dual Transport",
    body: "Stream straight off the ESP32 over BLE Nordic UART or plain WebSocket — auto-reconnect, scan-and-pair, zero drivers.",
  },
  {
    icon: (
      <>
        <path d="M12 3a9 9 0 019 9M12 7a5 5 0 015 5M12 11h.01" />
        <path d="M12 21a9 9 0 01-9-9" opacity="0.4" />
      </>
    ),
    title: "Demo-First Design",
    body: "A full synthetic signal engine — fatigue waves, rep rhythm, spikes, burst holds — means it demos flawlessly anywhere, hardware optional.",
  },
];

export function Features() {
  return (
    <Section id="features" eyebrow="CAPABILITIES" title={<>Built for the gym,<br />engineered for the lab.</>}>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-slate-800 bg-bio-panel/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_8px_40px_rgba(52,211,153,0.08)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-bold tracking-wide text-slate-100">{f.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "SENSE",
    color: "#34D399",
    body: "The ESP32 suit samples four EMG pads plus PPG heart-rate and normalizes everything to % of maximum voluntary contraction.",
  },
  {
    n: "02",
    title: "STREAM",
    color: "#22D3EE",
    body: "Newline-delimited JSON flows at 10Hz over BLE (Nordic UART) or WiFi WebSocket — parsed by a transport-agnostic signal layer.",
  },
  {
    n: "03",
    title: "LEARN",
    color: "#FBBF24",
    body: "Strain index, calorie burn and stride consistency are derived live; sessions export as labeled datasets for exoskeleton model training.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how" eyebrow="PIPELINE" title={<>From electrode to exoskeleton.</>}>
      <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
        <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-emerald-400/40 via-cyan-400/30 to-amber-400/40 lg:block" />
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-slate-800 bg-bio-panel/60 p-6">
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-2xl font-extrabold"
                style={{ color: s.color, textShadow: `0 0 18px ${s.color}55` }}
              >
                {s.n}
              </span>
              <span className="text-sm font-bold tracking-[0.25em]" style={{ color: s.color }}>
                {s.title}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-black/60 p-5 font-mono text-xs leading-6">
        <div className="text-slate-600">// ESP32 firmware contract — newline delimited</div>
        <div>
          <span className="text-slate-500">{"{"}</span>
          <span className="text-emerald-300">"emg"</span>
          <span className="text-slate-500">:</span>
          <span className="text-cyan-300">[62.4, 58.1, 70.2, 55.0]</span>
          <span className="text-slate-500">,</span>{" "}
          <span className="text-emerald-300">"hr"</span>
          <span className="text-slate-500">:</span>
          <span className="text-amber-300">118</span>
          <span className="text-slate-500">{"}"}</span>
        </div>
        <div className="text-slate-500">{"// compact form also accepted"}</div>
        <div className="text-slate-400">E:62.4,H:118</div>
      </div>
    </Section>
  );
}

const SPECS = [
  ["Transport A", "BLE · Nordic UART Service"],
  ["NUS Service UUID", "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"],
  ["TX Characteristic", "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"],
  ["Transport B", "WebSocket · ws://192.168.4.1:81/"],
  ["Sample Rate", "10 Hz (100 ms ticks)"],
  ["EMG Range", "0 – 100 (% MVC, per channel)"],
  ["Heart Rate", "30 – 230 BPM (PPG)"],
  ["Derived Metrics", "Strain EMA · kcal model · stride CV score"],
];

export function HardwareSpec() {
  return (
    <Section id="hardware" eyebrow="HARDWARE INTERFACE" title={<>Plug into the suit.</>}>
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        {SPECS.map(([k, v], i) => (
          <div
            key={k}
            className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
              i % 2 === 0 ? "bg-bio-panel/70" : "bg-bio-panel/30"
            }`}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500">
              {k.toUpperCase()}
            </span>
            <span className={`font-mono text-xs ${k.includes("UUID") ? "break-all" : ""} text-slate-300`}>
              {v}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-slate-600">
        Any ESP32 flashing these frames works out of the box — the app ships with a synthetic
        generator that mimics this exact protocol, so you can develop without hardware.
      </p>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="7" fill="#0B1220" stroke="#1E293B" />
            <path d="M4 18h6l3-8 5 14 3-6h7" stroke="#34D399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-bold tracking-[0.3em] text-slate-300">
            BIOSIGNAL<span className="text-emerald-400"> AI</span>
          </span>
        </div>
        <p className="text-[11px] tracking-wide text-slate-600">
          Built in 24 hours · React Native + Expo · Skia · Reanimated · Vite
        </p>
        <a
          href="https://github.com/ciprixn/Nimbus-Nova-"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold tracking-widest text-emerald-400/80 transition-colors hover:text-emerald-300"
        >
          SOURCE ON GITHUB ↗
        </a>
      </div>
    </footer>
  );
}
