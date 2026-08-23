import { Pulse, GithubLogo } from "@phosphor-icons/react";
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
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-bio-panel">
            <Pulse size={15} color="#34D399" weight="bold" />
          </span>
          <span className="text-[13px] font-bold tracking-[0.25em] text-slate-100">
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
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-bio-panel/60 px-3.5 py-1.5 text-xs font-bold tracking-wider text-slate-200 transition-colors hover:border-slate-500 active:scale-[0.98]"
          >
            <GithubLogo size={14} weight="fill" />
            GITHUB ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
