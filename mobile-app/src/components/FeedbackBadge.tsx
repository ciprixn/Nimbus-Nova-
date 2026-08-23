import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";

import { ZONE_STYLE, type Zone } from "@/theme";

interface Props {
  zone: Zone;
}

export function FeedbackBadge({ zone }: Props) {
  const s = ZONE_STYLE[zone];
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value =
      zone === "danger"
        ? withRepeat(withTiming(1.06, { duration: 420 }), -1)
        : withSpring(1);
  }, [zone, pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      style={[anim, { borderColor: s.color }]}
      className="items-center rounded-2xl border px-5 py-3"
    >
      <View
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          backgroundColor: `${s.color}14`,
          shadowColor: s.color,
          shadowOpacity: zone === "danger" ? 0.45 : 0.25,
          shadowRadius: 18
        }}
      />
      <View className="flex-row items-center gap-2">
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: `${s.color}22` }}
        >
          <Text className="text-xs font-bold" style={{ color: s.color }}>
            {s.glyph}
          </Text>
        </View>
        <Text className="text-[13px] font-bold tracking-[0.16em]" style={{ color: s.color }}>
          {s.label}
        </Text>
      </View>
      <Text className="mt-1 text-[11px] text-slate-400">{s.coach}</Text>
    </Animated.View>
  );
}
