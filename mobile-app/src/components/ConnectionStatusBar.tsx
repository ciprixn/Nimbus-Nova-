import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

import type { ConnectionStatus } from "@/types/signal";

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  streaming: "#34D399",
  connecting: "#FBBF24",
  disconnected: "#64748B",
  error: "#F87171"
};

interface Props {
  status: ConnectionStatus;
  message: string;
  sourceLabel: string;
}

export function ConnectionStatusBar({ status, message, sourceLabel }: Props) {
  const color = STATUS_COLOR[status];
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value =
      status === "streaming" || status === "connecting"
        ? withRepeat(withTiming(0.25, { duration: 700 }), -1, true)
        : withTiming(1);
  }, [status, opacity]);

  const dotAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="flex-row items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
      <Animated.View
        style={[dotAnim, { backgroundColor: color }]}
        className="h-2 w-2 rounded-full"
      />
      <View className="flex-1">
        <Text className="text-[11px] font-bold tracking-[0.14em]" style={{ color }}>
          {status.toUpperCase()} · {sourceLabel.toUpperCase()}
        </Text>
        {!!message && (
          <Text className="mt-0.5 text-[10px] text-slate-500" numberOfLines={1}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
