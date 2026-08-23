import { Text, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BiometricCard } from "@/components/BiometricCard";
import { ConnectionStatusBar } from "@/components/ConnectionStatusBar";
import { SegmentedControl, SwitchRow } from "@/components/Controls";
import { NeonButton } from "@/components/NeonButton";
import { EmgWaveformChart } from "@/components/charts/EmgWaveformChart";
import { useEMGData, useSensorControl } from "@/state/SensorProvider";
import { COLORS } from "@/theme";
import { fmtClock } from "@/utils/format";

const SOURCE_OPTIONS = [
  { id: "mock" as const, label: "DEMO" },
  { id: "ble" as const, label: "BLE" },
  { id: "websocket" as const, label: "WIFI" }
];

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { frame, biometrics } = useEMGData();
  const {
    mode,
    status,
    statusMessage,
    sourceLabel,
    totalFrames,
    sessionStartedAt,
    activate,
    resetSession
  } = useSensorControl();

  return (
    <View className="flex-1 bg-bio-void" style={{ paddingTop: insets.top + 8 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[11px] font-bold tracking-[0.35em] text-emerald-400">
            BIOSIGNAL AI
          </Text>
          <Text className="mt-1 font-mono text-[10px] text-slate-500">
            ESP32 WEARABLE SUIT · TELEMETRY CORE
          </Text>
        </View>

        <ConnectionStatusBar
          status={status}
          message={statusMessage}
          sourceLabel={sourceLabel}
        />

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
              LIVE EMG WAVEFORM
            </Text>
            <Text className="font-mono text-[10px] text-slate-600">10 Hz · 24 s</Text>
          </View>
          <EmgWaveformChart height={210} />
          <View className="mt-3 flex-row items-center justify-end gap-3">
            <LegendDot color={COLORS.amber} label="<35 UNDER" />
            <LegendDot color={COLORS.emerald} label="OPTIMAL" />
            <LegendDot color={COLORS.red} label=">85 RISK" />
          </View>
        </View>

        <View className="flex-row gap-3">
          <BiometricCard
            label="HEART RATE"
            value={frame ? String(frame.hr) : "--"}
            unit="BPM"
            accent={COLORS.rose}
            footer="ESP32 PPG channel"
          />
          <BiometricCard
            label="MUSCLE STRAIN"
            value={biometrics.strainIndex.toFixed(1)}
            unit="%"
            accent={COLORS.cyan}
            footer="EMA-smoothed load"
          />
        </View>

        <View className="flex-row gap-3">
          <BiometricCard
            label="CALORIES"
            value={biometrics.calories.toFixed(2)}
            unit="kcal"
            accent={COLORS.amber}
            footer="EMG work + HR model"
          />
          <BiometricCard
            label="SESSION"
            value={fmtClock(Date.now() - sessionStartedAt)}
            accent={COLORS.emerald}
            footer={`${totalFrames.toLocaleString()} frames received`}
          />
        </View>

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
            SIGNAL SOURCE
          </Text>
          <View className="mt-3">
            <SegmentedControl options={SOURCE_OPTIONS} activeId={mode} onSelect={(m) => void activate(m)} />
          </View>
          <SwitchRow
            label="Demo / Mock Data Mode"
            sublabel={
              mode === "mock"
                ? "Synthetic sinusoidal + spike generator at 100ms ticks"
                : "Switch off to stream from the physical suit"
            }
            value={mode === "mock"}
            onChange={(v) => void activate(v ? "mock" : "ble")}
          />
          <Text className="mt-2 text-[10px] leading-4 text-slate-600">
            BLE uses Nordic UART (6E400001...). WiFi expects newline-delimited JSON
            on {"{emg:[..],hr:n}"} — e.g. ws://192.168.4.1:81/
          </Text>
        </View>

        <NeonButton title="RESET SESSION METRICS" variant="ghost" onPress={resetSession} />
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-[9px] tracking-widest text-slate-500">{label}</Text>
    </View>
  );
}

export default DashboardScreen;
