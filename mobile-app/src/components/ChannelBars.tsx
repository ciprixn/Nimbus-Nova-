import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor
} from "react-native-reanimated";

import { COLORS } from "@/theme";
import type { EmgFrame } from "@/types/signal";

const LABELS = ["CH1", "CH2", "CH3", "CH4"];

/** Live 4-channel EMG spectrum bars, spring-animated on the UI thread. */
export function ChannelBars({ frame }: { frame: EmgFrame | null }) {
  return (
    <View className="flex-1 gap-2.5">
      {LABELS.map((label, i) => (
        <ChannelBar key={label} label={label} value={frame?.channels[i] ?? 0} />
      ))}
    </View>
  );
}

function ChannelBar({ label, value }: { label: string; value: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(Math.min(100, Math.max(0, value)) / 100, {
      damping: 18,
      stiffness: 160
    });
  }, [value, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`
  }));

  const colorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.6, 0.85, 1],
      [COLORS.emerald, COLORS.emerald, COLORS.amber, COLORS.red]
    ) as string,
    shadowColor: interpolateColor(
      progress.value,
      [0, 0.6, 0.85, 1],
      [COLORS.emerald, COLORS.emerald, COLORS.amber, COLORS.red]
    ) as string
  }));

  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-8 font-mono text-[9px] font-bold text-slate-500">{label}</Text>
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/80">
        <Animated.View style={[barStyle, colorStyle]} className="h-full rounded-full" />
      </View>
    </View>
  );
}
