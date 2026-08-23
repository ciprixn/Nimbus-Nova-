import { Text, View } from "react-native";

interface Props {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  footer?: string;
}

export function BiometricCard({ label, value, unit, accent = "#34D399", footer }: Props) {
  return (
    <View
      className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
      style={{ shadowColor: accent, shadowOpacity: 0.18, shadowRadius: 14, elevation: 4 }}
    >
      <View className="flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <Text className="text-[9px] font-semibold tracking-[0.22em] text-slate-500">
          {label}
        </Text>
      </View>
      <View className="mt-2 flex-row items-baseline">
        <Text className="font-mono text-[26px] font-bold leading-7" style={{ color: accent }}>
          {value}
        </Text>
        {unit ? (
          <Text className="ml-1 text-xs font-medium text-slate-500">{unit}</Text>
        ) : null}
      </View>
      {footer ? (
        <Text className="mt-1 text-[10px] text-slate-600">{footer}</Text>
      ) : null}
    </View>
  );
}
