import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Features, Footer, HardwareSpec, HowItWorks } from "@/components/site/Sections";

export default function App() {
  return (
    <div className="min-h-full bg-bio-void text-slate-200">
      <Nav />
      <main>
        <Hero />
        <Features />
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        <HowItWorks />
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        <HardwareSpec />
      </main>
      <Footer />
    </div>
  );
}
