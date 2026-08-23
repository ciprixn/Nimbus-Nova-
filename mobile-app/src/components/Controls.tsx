import { Text, View, Switch } from "react-native";

interface Props {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function SwitchRow({ label, sublabel, value, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-3">
        <Text className="text-[13px] font-semibold text-slate-200">{label}</Text>
        {sublabel ? <Text className="mt-0.5 text-[11px] text-slate-500">{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#1E293B", true: "#34D39955" }}
        thumbColor={value ? "#34D399" : "#64748B"}
        ios_backgroundColor="#1E293B"
      />
    </View>
  );
}

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ id: T; label: string }>;
  activeId: T | null;
  onSelect: (id: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  activeId,
  onSelect
}: SegmentedProps<T>) {
  return (
    <View className="flex-row gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
      {options.map((opt) => {
        const active = opt.id === activeId;
        return (
          <View key={opt.id} className="flex-1">
            <Text
              onPress={() => onSelect(opt.id)}
              className={
                "rounded-lg py-2 text-center text-[11px] font-bold tracking-[0.14em] " +
                (active ? "text-slate-950" : "text-slate-400")
              }
              style={{
                backgroundColor: active ? "#34D399" : "transparent",
                overflow: "hidden"
              }}
            >
              {opt.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
