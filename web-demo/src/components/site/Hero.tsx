import { Waveform } from "@/components/Waveform";
import { useFrame } from "@/hooks/useSensor";

const APK_URL =
  "https://expo.dev/accounts/ciprixn/projects/biosignal-ai/builds/ae02ec1f-13f2-4266-99c4-0fdbd994f4db";

export function Hero() {
  const frame = useFrame();

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 lg:pt-24">
      <SignalBackdrop />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
            24H HACKATHON BUILD
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-zinc-50 sm:text-5xl">
            Every muscle contraction is a signal.{" "}
            <em className="text-bio-emerald">Nimbus Nova reads it live.</em>
          </h1>

          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-zinc-400">
            Four-channel EMG and heart-rate streaming from an ESP32 wearable suit —
            form coaching, injury alerts, and exportable datasets.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={APK_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-6 py-3 text-xs font-bold tracking-[0.14em] text-emerald-200 transition-all hover:bg-emerald-400/25 active:scale-[0.98]"
            >
              GET THE ANDROID APP
            </a>
            <a
              href="#how"
              className="rounded-xl border border-zinc-700 px-6 py-3 text-xs font-bold tracking-[0.14em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 active:scale-[0.98]"
            >
              HOW IT WORKS ↓
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-bio-panel/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold tracking-[0.22em] text-zinc-500">
              LIVE SIGNAL · SYNTHETIC FEED
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
              STREAMING
            </span>
          </div>
          <Waveform height={168} />
          <ChannelStrip frame={frame} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3 text-center">
            <HeroStat label="EMG" value={frame ? `${frame.emg.toFixed(0)}%` : "--"} color="#34D399" />
            <HeroStat label="HEART RATE" value={frame ? `${frame.hr}` : "--"} color="#FB7185" />
            <HeroStat label="CHANNELS" value="4/4" color="#E4E4E7" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChannelStrip({ frame }: { frame: ReturnType<typeof useFrame> }) {
  return (
    <div className="mt-3 space-y-1.5">
      {[0, 1, 2, 3].map((i) => {
        const v = frame?.channels[i] ?? 0;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-8 font-mono text-[9px] font-bold text-zinc-600">CH{i + 1}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800/80">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-150 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, v))}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono text-[9px] text-zinc-500">
              {v.toFixed(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[8px] font-semibold tracking-[0.2em] text-zinc-600">{label}</div>
    </div>
  );
}

/** Faint ECG trace sweeping behind the hero copy. */
function SignalBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 205 L180 205 L205 150 L230 260 L255 205 L420 205 L445 170 L465 230 L485 205 L640 205 L665 145 L688 265 L710 205 L1000 205"
        fill="none"
        stroke="#34D399"
        strokeWidth="1.5"
        strokeOpacity="0.10"
        strokeDasharray="220 900"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
