import { useEffect } from "react";
import { Text, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
  interpolateColor,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import type { SkPath } from "@shopify/react-native-skia";

import { clamp } from "@/utils/metrics";
import { COLORS } from "@/theme";

interface Props {
  value: number;
  size?: number;
}

const START_ANGLE = 135;
const SWEEP = 270;

const buildArc = (size: number, sweepDeg: number): SkPath => {
  "worklet";
  const r = size / 2 - 12;
  const p = Skia.Path.Make();
  p.addArc(
    { x: size / 2 - r, y: size / 2 - r, width: r * 2, height: r * 2 },
    START_ANGLE,
    Math.max(sweepDeg, 0.5)
  );
  return p;
};

/**
 * Circular muscle-load gauge. Arc sweep and color are driven by a spring on
 * the UI thread, so it stays fluid even while React re-renders at signal rate.
 */
export function StrainGauge({ value, size = 132 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(clamp(value / 100, 0, 1), {
      damping: 16,
      stiffness: 120
    });
  }, [value, progress]);

  const trackPath = useDerivedValue(() => buildArc(size, SWEEP), [size]);

  const valuePath = useDerivedValue(
    () => buildArc(size, progress.value * SWEEP),
    [size]
  );

  const arcColor = useDerivedValue<string>(() =>
    interpolateColor(
      progress.value,
      [0, 0.6, 0.85, 1],
      [COLORS.emerald, COLORS.emerald, COLORS.amber, COLORS.red]
    ) as string
  );

  return (
    <View style={{ width: size, height: size }} className="relative">
      <Canvas style={{ flex: 1 }}>
        <Path
          path={trackPath}
          style="stroke"
          strokeWidth={10}
          color={COLORS.line}
          strokeCap="round"
        />
        <Path
          path={valuePath}
          style="stroke"
          strokeWidth={10}
          color={arcColor}
          strokeCap="round"
        />
      </Canvas>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="font-mono text-2xl font-bold text-slate-100">
          {Math.round(value)}
          <Text className="text-sm text-slate-500">%</Text>
        </Text>
        <Text className="mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-slate-500">
          STRAIN
        </Text>
      </View>
    </View>
  );
}
