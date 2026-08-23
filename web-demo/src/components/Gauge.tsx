interface Props {
  value: number;
  size?: number;
}

const START = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(size: number, sweepDeg: number): string {
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const [sx, sy] = polar(cx, cy, r, START);
  const [ex, ey] = polar(cx, cy, r, START + sweepDeg);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

export function Gauge({ value, size = 128 }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct > 85 ? "#F87171" : pct > 60 ? "#FBBF24" : pct >= 0 ? "#34D399" : "#34D399";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path
          d={arcPath(size, SWEEP)}
          fill="none"
          stroke="#1E293B"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          d={arcPath(size, Math.max((pct / 100) * SWEEP, 0.5))}
          fill="none"
          stroke={color}
          strokeWidth={9}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 120ms linear, stroke 200ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold text-slate-100">
          {Math.round(pct)}
          <span className="text-sm text-slate-500">%</span>
        </span>
        <span className="mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-slate-500">
          STRAIN
        </span>
      </div>
    </div>
  );
}
