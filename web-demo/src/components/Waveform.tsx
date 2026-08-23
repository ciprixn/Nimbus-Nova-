import { useEffect, useRef } from "react";

import { sensor } from "@/engine/sensor";
import { THRESHOLDS } from "@/engine/core";

interface Props {
  height?: number;
  capacity?: number;
}

const COLORS = {
  grid: "#27272A",
  amber: "#FBBF24",
  red: "#F87171",
  emerald: "#34D399",
};

/**
 * Scrolling oscilloscope. Frames land in a ring buffer at 10Hz; a
 * requestAnimationFrame loop interpolates the horizontal offset between ticks,
 * so the wave glides at display refresh rate with zero React re-renders.
 */
export function Waveform({ height = 220, capacity = 240 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: height });

  useEffect(() => {
    const buf: number[] = [];
    let lastTickAt = performance.now();
    const unsub = sensor.subscribe((f) => {
      buf.push(f.emg);
      if (buf.length > capacity) buf.shift();
      lastTickAt = performance.now();
    });

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return unsub;

    const ctx = canvas.getContext("2d");
    if (!ctx) return unsub;

    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(wrap);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const { w, h } = sizeRef.current;
      if (w <= 0 || buf.length < 2) return;

      const stepX = w / (capacity - 2);
      const offX = Math.min((performance.now() - lastTickAt) / 100, 1) * stepX;
      const padTop = 14;
      const usableH = h - padTop - 10;
      const yOf = (v: number) => padTop + usableH * (1 - Math.min(100, Math.max(0, v)) / 100);

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (const f of [0.25, 0.5, 0.75]) {
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, h * f);
        ctx.lineTo(w, h * f);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const dashed = (pct: number, color: string, alpha: number) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, yOf(pct));
        ctx.lineTo(w, yOf(pct));
        ctx.stroke();
        ctx.restore();
      };
      dashed(THRESHOLDS.under, COLORS.amber, 0.35);
      dashed(THRESHOLDS.risk, COLORS.red, 0.4);

      const pts: Array<[number, number]> = [];
      const maxPts = Math.min(buf.length, Math.ceil(w / stepX) + 3);
      for (let i = 0; i < maxPts; i++) {
        pts.push([w - offX - i * stepX, yOf(buf[buf.length - 1 - i])]);
      }

      const tracePath = new Path2D();
      tracePath.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i - 1];
        const [x, y] = pts[i];
        const midX = (px + x) / 2;
        tracePath.bezierCurveTo(midX, py, midX, y, x, y);
      }

      const fillPath = new Path2D(tracePath);
      fillPath.lineTo(pts[pts.length - 1][0], h);
      fillPath.lineTo(pts[0][0], h);
      fillPath.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(52,211,153,0.28)");
      grad.addColorStop(1, "rgba(52,211,153,0)");
      ctx.fillStyle = grad;
      ctx.fill(fillPath);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.save();
      ctx.shadowColor = "rgba(52,211,153,0.8)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(52,211,153,0.45)";
      ctx.lineWidth = 6;
      ctx.stroke(tracePath);
      ctx.restore();

      ctx.strokeStyle = COLORS.emerald;
      ctx.lineWidth = 2.5;
      ctx.stroke(tracePath);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsub();
    };
  }, [capacity, height]);

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-xl" style={{ height }}>
      <canvas ref={canvasRef} />
      <span className="absolute left-3 top-2 text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
        EMG %
      </span>
    </div>
  );
}
