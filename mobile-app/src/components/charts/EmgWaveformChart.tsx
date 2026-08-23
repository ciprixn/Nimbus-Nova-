import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  BlurMask,
  Canvas,
  DashPathEffect,
  Line,
  LinearGradient,
  Path,
  Skia,
  vec
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue
} from "react-native-reanimated";
import type { SkPath } from "@shopify/react-native-skia";

import { SensorService } from "@/services/SensorService";
import { COLORS, THRESHOLDS } from "@/theme";

const TICK_MS = 100;
const DEFAULT_CAPACITY = 240;

const buildWave = (
  arr: readonly number[],
  w: number,
  h: number,
  offX: number,
  capacity: number,
  closeForFill: boolean
): SkPath => {
  "worklet";
  const p = Skia.Path.Make();
  if (w <= 0 || arr.length < 2) return p;

  const stepX = w / (capacity - 2);
  const padTop = 14;
  const padBottom = 10;
  const usableH = h - padTop - padBottom;
  const yOf = (v: number): number =>
    padTop + usableH * (1 - Math.min(100, Math.max(0, v)) / 100);

  const maxPts = Math.min(arr.length, Math.ceil(w / stepX) + 3);
  let prevX = w - offX;
  let prevY = yOf(arr[arr.length - 1]);
  p.moveTo(prevX, prevY);

  for (let i = 1; i < maxPts; i++) {
    const x = w - offX - i * stepX;
    const y = yOf(arr[arr.length - 1 - i]);
    const midX = (prevX + x) / 2;
    p.cubicTo(midX, prevY, midX, y, x, y);
    prevX = x;
    prevY = y;
  }

  if (closeForFill) {
    p.lineTo(prevX, h);
    p.lineTo(w - offX, h);
    p.close();
  }
  return p;
};

interface Props {
  height?: number;
  capacity?: number;
}

/**
 * Scrolling EMG oscilloscope. Samples arrive at 10Hz from SensorService into
 * shared values; the horizontal scroll offset is interpolated on the UI thread
 * every frame, so the wave glides smoothly at 60fps with zero JS-thread work.
 */
export function EmgWaveformChart({ height = 220, capacity = DEFAULT_CAPACITY }: Props) {
  const [width, setWidth] = useState(0);

  const data = useSharedValue<number[]>([]);
  const lastTickAt = useSharedValue(0);
  const clock = useSharedValue(0);

  useFrameCallback((info) => {
    clock.value = info.timestamp;
  }, true);

  useEffect(() => {
    const buf: number[] = [];
    return SensorService.onFrame((f) => {
      buf.push(f.emg);
      if (buf.length > capacity) buf.shift();
      data.value = buf.slice();
      lastTickAt.value = performance.now();
    });
  }, [capacity, data, lastTickAt]);

  const offset = useDerivedValue(() => {
    if (!lastTickAt.value || width <= 0) return 0;
    const stepX = width / (capacity - 2);
    const progress = (clock.value - lastTickAt.value) / TICK_MS;
    return Math.min(Math.max(progress, 0), 1) * stepX;
  });

  const linePath = useDerivedValue(
    () => buildWave(data.value, width, height, offset.value, capacity, false),
    [width, height, capacity]
  );

  const fillPath = useDerivedValue(
    () => buildWave(data.value, width, height, offset.value, capacity, true),
    [width, height, capacity]
  );

  const pctY = (pct: number): number =>
    14 + (height - 24) * (1 - pct / 100);

  return (
    <View style={{ height }} className="relative">
      <View
        className="absolute inset-0 overflow-hidden rounded-xl"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <Canvas style={{ flex: 1 }}>
            {[0.25, 0.5, 0.75].map((f) => (
              <Line
                key={f}
                p1={vec(0, height * f)}
                p2={vec(width, height * f)}
                color={COLORS.line}
                strokeWidth={1}
              />
            ))}
            <Line
              p1={vec(0, pctY(THRESHOLDS.underActivation))}
              p2={vec(width, pctY(THRESHOLDS.underActivation))}
              color={COLORS.amber}
              strokeWidth={1}
              opacity={0.3}
            >
              <DashPathEffect intervals={[4, 6]} />
            </Line>
            <Line
              p1={vec(0, pctY(THRESHOLDS.injuryRisk))}
              p2={vec(width, pctY(THRESHOLDS.injuryRisk))}
              color={COLORS.red}
              strokeWidth={1}
              opacity={0.35}
            >
              <DashPathEffect intervals={[4, 6]} />
            </Line>

            <Path path={fillPath} style="fill">
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height)}
                colors={[`${COLORS.emerald}55`, `${COLORS.emerald}00`]}
              />
            </Path>

            <Path
              path={linePath}
              style="stroke"
              strokeWidth={7}
              color={COLORS.emerald}
              opacity={0.22}
              strokeCap="round"
              strokeJoin="round"
            >
              <BlurMask blur={7} style="normal" />
            </Path>
            <Path
              path={linePath}
              style="stroke"
              strokeWidth={2.5}
              color={COLORS.emerald}
              strokeCap="round"
              strokeJoin="round"
            >
              <BlurMask blur={1.5} style="solid" />
            </Path>
          </Canvas>
        )}

        <Text className="absolute left-3 top-2 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
          EMG %
        </Text>
        <Text
          className="absolute right-3 text-[9px] tracking-widest"
          style={{ top: pctY(THRESHOLDS.underActivation) - 6, color: `${COLORS.amber}99` }}
        >
          35%
        </Text>
        <Text
          className="absolute right-3 text-[9px] tracking-widest"
          style={{ top: pctY(THRESHOLDS.injuryRisk) - 6, color: `${COLORS.red}AA` }}
        >
          85%
        </Text>
      </View>
    </View>
  );
}
