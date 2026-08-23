import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-bio-panel/70 shadow-[0_0_24px_rgba(2,6,23,0.6)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Card({
  label,
  value,
  unit,
  accent,
  footer,
}: {
  label: string;
  value: string;
  unit?: string;
  accent: string;
  footer?: string;
}) {
  return (
    <Panel className="flex-1 p-4">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[9px] font-semibold tracking-[0.22em] text-slate-500">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline">
        <span className="font-mono text-[26px] font-bold leading-7" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
      </div>
      {footer && <div className="mt-1 text-[10px] text-slate-600">{footer}</div>}
    </Panel>
  );
}
