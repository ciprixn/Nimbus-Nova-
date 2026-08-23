import { Waveform } from "@/components/Waveform";
import { useFrame } from "@/hooks/useSensor";

const APK_URL =
  "https://expo.dev/accounts/ciprixn/projects/biosignal-ai/builds/ae02ec1f-13f2-4266-99c4-0fdbd994f4db";

export function Hero() {
  const frame = useFrame();

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 300px at 75% 10%, rgba(52,211,153,0.09), transparent 70%), radial-gradient(500px 260px at 15% 30%, rgba(34,211,238,0.06), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-[10px] font-bold tracking-[0.25em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
            24H HACKATHON BUILD
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-50 sm:text-[52px]">
            Your muscles,{" "}
            <span className="bg-gradient-to-r from-bio-emerald via-bio-cyan to-bio-emerald bg-clip-text text-transparent">
              decoded in real time.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
            BioSignal AI streams EMG and heart-rate telemetry from an ESP32 wearable suit,
            coaches your workout form with live injury-risk zones, and logs high-frequency
            movement data to train the next generation of mobility exoskeletons.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={APK_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-400/60 bg-emerald-400/15 px-6 py-3 text-xs font-bold tracking-[0.18em] text-emerald-300 transition-all hover:bg-emerald-400/25 hover:shadow-[0_0_24px_rgba(52,211,153,0.35)]"
            >
              GET THE ANDROID APP
            </a>
            <a
              href="#how"
              className="rounded-xl border border-slate-700 px-6 py-3 text-xs font-bold tracking-[0.18em] text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              HOW IT WORKS ↓
            </a>
          </div>

          <div className="mt-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-600">
            <Chip>10 Hz</Chip>
            <Chip>4× EMG CH</Chip>
            <Chip>BLE + WIFI</Chip>
            <Chip>PPG HEART RATE</Chip>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-bio-panel/70 p-4 shadow-[0_0_60px_rgba(52,211,153,0.07)] backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-[0.25em] text-slate-500">
              LIVE SIGNAL · SYNTHETIC FEED
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
              STREAMING
            </span>
          </div>
          <Waveform height={170} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
            <HeroStat label="EMG" value={frame ? `${frame.emg.toFixed(0)}%` : "--"} color="#34D399" />
            <HeroStat label="HEART RATE" value={frame ? `${frame.hr}` : "--"} color="#FB7185" />
            <HeroStat label="CHANNELS" value="4/4" color="#22D3EE" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-slate-800 bg-bio-panel/60 px-2 py-1">{children}</span>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[8px] font-semibold tracking-[0.2em] text-slate-600">{label}</div>
    </div>
  );
}
