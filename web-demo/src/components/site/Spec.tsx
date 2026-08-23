import { useReveal } from "@/hooks/useReveal";

type ReactNode = React.ReactNode;

function Reveal({ children }: { children: ReactNode }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "tranzinc-y-0 opacity-100" : "tranzinc-y-5 opacity-0"
      }`}
    >
      {children}
    </div>
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
    color: "#E4E4E7",
    body: "Newline-delimited JSON flows at 10Hz over BLE Nordic UART or WiFi WebSocket — parsed by a transport-agnostic signal layer.",
  },
  {
    n: "03",
    title: "LEARN",
    color: "#FBBF24",
    body: "Strain, calories and stride consistency are derived live; sessions export as labeled datasets for exoskeleton model training.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
      <Reveal>
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          From electrode to exoskeleton.
        </h2>

        <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-emerald-400/30 via-cyan-400/25 to-amber-400/30 lg:block" />
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-zinc-800 bg-bio-panel/60 p-6">
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-2xl font-extrabold"
                  style={{ color: s.color }}
                >
                  {s.n}
                </span>
                <span className="text-sm font-bold tracking-[0.22em]" style={{ color: s.color }}>
                  {s.title}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="font-mono text-[11px] leading-6 text-zinc-500">// newline-delimited frames</div>
          <div className="font-mono text-xs leading-6">
            <span className="text-zinc-500">{"{"}</span>
            <span className="text-emerald-300">"emg"</span>
            <span className="text-zinc-500">:</span>
            <span className="text-zinc-300">[62.4, 58.1, 70.2, 55.0]</span>
            <span className="text-zinc-500">,</span>{" "}
            <span className="text-emerald-300">"hr"</span>
            <span className="text-zinc-500">:</span>
            <span className="text-amber-300">118</span>
            <span className="text-zinc-500">{"}"}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FEATURED = [
  { value: "10 Hz", label: "sample rate" },
  { value: "4", label: "EMG channels" },
  { value: "0–100", label: "% MVC range" },
];

const CLUSTERS = [
  {
    title: "Transport",
    rows: [
      ["BLE", "Nordic UART Service"],
      ["WiFi", "ws://192.168.4.1:81/"],
      ["Fallback", "Synthetic generator"],
    ],
  },
  {
    title: "Payload",
    rows: [
      ["JSON", '{"emg":[...],"hr":118}'],
      ["Compact", "E:62.4,H:118"],
      ["Encoding", "UTF-8, \\n delimited"],
    ],
  },
  {
    title: "Derived",
    rows: [
      ["Strain", "EMA of aggregate EMG"],
      ["Calories", "EMG work + HR model"],
      ["Stride", "Peak-interval CV score"],
    ],
  },
];

export function HardwareSpec() {
  return (
    <section id="hardware" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
      <Reveal>
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Plug into the suit.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURED.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-emerald-400/[0.06] to-transparent p-6"
            >
              <div className="font-mono text-3xl font-extrabold text-bio-emerald">{f.value}</div>
              <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                {f.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {CLUSTERS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-zinc-800 bg-bio-panel/60 p-5">
              <div className="text-[11px] font-bold tracking-[0.22em] text-zinc-400">
                {c.title.toUpperCase()}
              </div>
              <dl className="mt-3 space-y-2.5">
                {c.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10px] tracking-wider text-zinc-600">{k}</dt>
                    <dd className="break-all font-mono text-xs text-zinc-300">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-5 max-w-[65ch] text-[12px] leading-relaxed text-zinc-600">
          Any ESP32 flashing these frames works out of the box — and the app ships with a
          synthetic generator that mimics this exact protocol, so you can develop without hardware.
        </p>
      </Reveal>
    </section>
  );
}
