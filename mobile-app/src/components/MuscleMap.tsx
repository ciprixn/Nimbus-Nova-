import { useEffect } from "react";
import { Text, View } from "react-native";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import {
  interpolateColor,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import { COLORS } from "@/theme";
import type { EmgFrame } from "@/types/signal";

interface Props {
  frame: EmgFrame | null;
  height?: number;
}

const CHANNEL_LABELS = ["L ARM", "R ARM", "CHEST", "LEGS"];

const ZONES = [
  { x: 82, y: 64, w: 18, h: 44 },   // left arm
  { x: 160, y: 64, w: 18, h: 44 },  // right arm
  { x: 108, y: 58, w: 44, h: 36 },  // chest
  { x: 106, y: 148, w: 48, h: 48 }, // legs
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v / 100));

/**
 * Animated body map: each of the four suit EMG channels lights up its muscle
 * group (emerald -> amber -> red by intensity), while a scanner sweep line
 * loops continuously for the medical-HUD vibe.
 */
export function MuscleMap({ frame, height = 230 }: Props) {
  const clock = useSharedValue(0);

  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: 2800 }), -1);
  }, [clock]);

  return (
    <View style={{ height }} className="relative">
      <Canvas style={{ flex: 1 }}>
        <Body />
        {ZONES.map((z, i) => (
          <MuscleZone key={i} index={i} frame={frame} rect={z} />
        ))}
        <ScanLine clock={clock} height={height} />
      </Canvas>
      <View className="absolute bottom-1 left-0 right-0 flex-row justify-center gap-5">
        {CHANNEL_LABELS.map((l) => (
          <Text key={l} className="text-[8px] font-bold tracking-[0.18em] text-slate-600">
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Body() {
  return (
    <Group opacity={0.95}>
      <Circle cx={130} cy={32} r={15} color={COLORS.line} />
      <RoundedRect x={106} y={53} width={48} height={88} r={15} color={COLORS.line} />
      <RoundedRect x={84} y={60} width={16} height={74} r={8} color={COLORS.line} />
      <RoundedRect x={160} y={60} width={16} height={74} r={8} color={COLORS.line} />
      <RoundedRect x={108} y={145} width={19} height={76} r={9} color={COLORS.line} />
      <RoundedRect x={133} y={145} width={19} height={76} r={9} color={COLORS.line} />
    </Group>
  );
}

function MuscleZone({
  index,
  frame,
  rect,
}: {
  index: number;
  frame: EmgFrame | null;
  rect: { x: number; y: number; w: number; h: number };
}) {
  const level = useSharedValue(0);

  useEffect(() => {
    level.value = frame?.channels[index] ?? 0;
  }, [frame, index, level]);

  const opacity = useDerivedValue(() => clamp01(level.value) * 0.9);

  const color = useDerivedValue<string>(() =>
    interpolateColor(
      clamp01(level.value),
      [0, 0.6, 0.85, 1],
      [COLORS.emerald, COLORS.emerald, COLORS.amber, COLORS.red]
    ) as string
  );

  return (
    <RoundedRect
      x={rect.x}
      y={rect.y}
      width={rect.w}
      height={rect.h}
      r={8}
      color={color}
      opacity={opacity}
    >
      <BlurMask blur={7} style="normal" />
    </RoundedRect>
  );
}

function ScanLine({
  clock,
  height,
}: {
  clock: SharedValue<number>;
  height: number;
}) {
  const start = useDerivedValue(() => {
    const y = 12 + clock.value * (height - 40);
    return vec(74, y);
  });
  const end = useDerivedValue(() => {
    const y = 12 + clock.value * (height - 40);
    return vec(186, y);
  });
  const dotY = useDerivedValue(() => 12 + clock.value * (height - 40));
  const opacity = useDerivedValue(() => 0.35 * Math.sin(Math.PI * clock.value));

  return (
    <Group>
      <Line
        p1={start}
        p2={end}
        color={COLORS.emerald}
        strokeWidth={1.5}
        opacity={opacity}
      >
        <BlurMask blur={4} style="normal" />
      </Line>
      <Circle cx={130} cy={dotY} r={1.6} color={COLORS.emerald} opacity={opacity} />
    </Group>
  );
}
