import { Waveform } from "@/components/Waveform";
import { useFrame } from "@/hooks/useSensor";

const APK_URL =
  "https://expo.dev/accounts/ciprixn/projects/biosignal-ai/builds/ae02ec1f-13f2-4266-99c4-0fdbd994f4db";

export function Hero() {
  const frame = useFrame();

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 lg:pt-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(640px 320px at 78% 8%, rgba(52,211,153,0.07), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
            24H HACKATHON BUILD
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-50 sm:text-5xl">
            Your muscles,{" "}
            <em className="not-italic font-black italic text-bio-emerald">decoded</em> in
            real time.
          </h1>

          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-slate-400">
            Four-channel EMG and heart-rate telemetry from an ESP32 suit — live form
            coaching, injury alerts, and exportable datasets.
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
              className="rounded-xl border border-slate-700 px-6 py-3 text-xs font-bold tracking-[0.14em] text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 active:scale-[0.98]"
            >
              HOW IT WORKS ↓
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bio-panel/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold tracking-[0.22em] text-slate-500">
              LIVE SIGNAL · SYNTHETIC FEED
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-bio-emerald" />
              STREAMING
            </span>
          </div>
          <Waveform height={170} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
            <HeroStat label="EMG" value={frame ? `${frame.emg.toFixed(0)}%` : "--"} color="#34D399" />
            <HeroStat label="HEART RATE" value={frame ? `${frame.hr}` : "--"} color="#FB7185" />
            <HeroStat label="CHANNELS" value="4/4" color="#22D3EE" />
          </div>
        </div>
      </div>
    </section>
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
