import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Ticker } from "@/components/site/Ticker";
import { Features } from "@/components/site/Features";
import { HowItWorks, HardwareSpec } from "@/components/site/Spec";
import { Chatbot } from "@/components/site/Chatbot";
import { Logo } from "@/components/site/Logo";

export default function App() {
  return (
    <div className="min-h-full bg-bio-void text-zinc-200 font-sans antialiased">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Features />
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <HowItWorks />
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <HardwareSpec />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center">
        <span className="flex items-center gap-2 text-zinc-300">
          <Logo size={22} />
          <span className="text-xs font-bold tracking-[0.3em]">
            NIMBUS<span className="text-bio-emerald"> NOVA</span>
          </span>
        </span>
        <p className="text-[11px] tracking-wide text-zinc-600">
          Built in 24 hours · React Native + Expo · Skia · Reanimated · Vite
        </p>
        <a
          href="https://github.com/ciprixn/Nimbus-Nova-"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold tracking-widest text-emerald-400/80 transition-colors hover:text-emerald-300"
        >
          GITHUB ↗
        </a>
      </div>
    </footer>
  );
}
