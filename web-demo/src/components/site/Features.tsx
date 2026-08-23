import {
  Pulse,
  Broadcast,
  Camera,
  DownloadSimple,
  ShieldWarning,
} from "@phosphor-icons/react";

import { Waveform } from "@/components/Waveform";
import { useReveal } from "@/hooks/useReveal";

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "tranzinc-y-0 opacity-100" : "tranzinc-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

type ReactNode = React.ReactNode;

const ICON_PROPS = {
  size: 18,
  color: "#6EE7B7",
  weight: "regular" as const,
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
      <Reveal>
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          A biomechanics lab, condensed into one suit.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.07] to-transparent p-5 md:col-span-2">
            <FeatureHead icon={<Pulse {...ICON_PROPS} />} title="Live Biomechanical Feedback" />
            <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-zinc-500">
              Scrolling oscilloscope, per-channel spectrum and an animated muscle-map HUD,
              rendered on-device at a silky 60fps.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <Waveform height={120} />
            </div>
          </div>

          <FeatureCell
            icon={<Camera {...ICON_PROPS} />}
            title="AI Form Guard"
            body="The camera overlay classifies every rep in real time with instant coaching cues."
          />

          <FeatureCell
            icon={<ShieldWarning {...ICON_PROPS} />}
            title="Injury Prevention"
            body="Hard thresholds at 35% and 85% activation. Cross the red line and the screen pulses before anything tears."
          />

          <FeatureCell
            icon={<DownloadSimple {...ICON_PROPS} />}
            title="Training Data Pipeline"
            body="One tap exports versioned JSON sessions or flat CSV tables, shaped for ML ingestion."
          />

          <div className="rounded-2xl border border-zinc-800 bg-black/50 p-5 lg:bg-black/70">
            <FeatureHead icon={<Broadcast {...ICON_PROPS} />} title="Dual Transport" />
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
              Stream straight off the ESP32 — scan-and-pair over BLE or raw WebSocket with
              auto-reconnect.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-bio-panel/80 p-3 font-mono text-[11px] leading-5 text-zinc-400">
{`ws://192.168.4.1:81/
E:62.4,H:118`}
            </pre>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FeatureHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10">
        {icon}
      </span>
      <h3 className="text-sm font-bold tracking-wide text-zinc-100">{title}</h3>
    </div>
  );
}

function FeatureCell({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-bio-panel/60 p-5 transition-colors duration-300 hover:border-zinc-600">
      <FeatureHead icon={icon} title={title} />
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{body}</p>
    </div>
  );
}
