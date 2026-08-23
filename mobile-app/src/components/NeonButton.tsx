import { Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

type Variant = "primary" | "cyan" | "danger" | "ghost";

const VARIANT: Record<Variant, { border: string; text: string }> = {
  primary: { border: "#34D399", text: "#34D399" },
  cyan: { border: "#22D3EE", text: "#22D3EE" },
  danger: { border: "#F87171", text: "#F87171" },
  ghost: { border: "#1E293B", text: "#94A3B8" }
};

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
}

export function NeonButton({ title, onPress, disabled = false, variant = "primary" }: Props) {
  const scale = useSharedValue(1);
  const v = VARIANT[variant];

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14 });
      }}
      className="flex-1 rounded-xl border px-3 py-3"
      style={{
        opacity: disabled ? 0.35 : 1,
        borderColor: `${v.border}55`,
        backgroundColor: `${v.border}0D`,
        shadowColor: v.border,
        shadowOpacity: disabled ? 0 : 0.25,
        shadowRadius: 12
      }}
    >
      <Animated.View style={anim} className="items-center">
        <Text className="text-[11px] font-bold tracking-[0.18em]" style={{ color: v.text }}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
