import { useEffect, useState } from "react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#hardware", label: "Hardware" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-slate-800/80 bg-bio-void/85 backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" width="26" height="26">
            <rect width="32" height="32" rx="7" fill="#0B1220" stroke="#1E293B" />
            <path
              d="M4 18h6l3-8 5 14 3-6h7"
              stroke="#34D399"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[13px] font-bold tracking-[0.3em] text-slate-100">
            NIMBUS<span className="text-bio-emerald"> NOVA</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold tracking-widest text-slate-400 transition-colors hover:text-emerald-300"
            >
              {l.label.toUpperCase()}
            </a>
          ))}
          <a
            href="https://github.com/ciprixn/Nimbus-Nova-"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-300 transition-all hover:bg-emerald-400/20 hover:shadow-[0_0_18px_rgba(52,211,153,0.35)]"
          >
            GITHUB
          </a>
        </nav>
      </div>
    </header>
  );
}
