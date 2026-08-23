import { GithubLogo, List, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "./Logo";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#hardware", label: "Hardware" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setScrolled(!entries[0]?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 h-4 w-full" />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? "border-b border-zinc-800/80 bg-bio-void/85 backdrop-blur-md" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-2.5 text-slate-100">
            <Logo size={30} />
            <span className="text-[13px] font-bold tracking-[0.22em]">
              NIMBUS<span className="text-bio-emerald"> NOVA</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 sm:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs font-semibold tracking-widest text-zinc-400 transition-colors hover:text-emerald-300"
              >
                {l.label.toUpperCase()}
              </a>
            ))}
            <a
              href="https://github.com/ciprixn/Nimbus-Nova-"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-bio-panel/60 px-3.5 py-1.5 text-xs font-bold tracking-wider text-zinc-200 transition-colors hover:border-zinc-500 active:scale-[0.98]"
            >
              <GithubLogo size={14} weight="fill" />
              GITHUB ↗
            </a>
          </nav>

          <button
            className="text-zinc-300 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-zinc-800 bg-bio-void/95 px-6 py-4 backdrop-blur-md sm:hidden">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-semibold tracking-widest text-zinc-300"
              >
                {l.label.toUpperCase()}
              </a>
            ))}
            <a
              href="https://github.com/ciprixn/Nimbus-Nova-"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-2 border-t border-zinc-800 pt-3 text-sm font-bold text-emerald-300"
            >
              <GithubLogo size={16} /> GITHUB ↗
            </a>
          </div>
        )}
      </header>
    </>
  );
}
