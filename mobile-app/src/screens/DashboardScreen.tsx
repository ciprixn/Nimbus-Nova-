import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { BiometricCard } from "@/components/BiometricCard";
import { ConnectionStatusBar } from "@/components/ConnectionStatusBar";
import { SegmentedControl, SwitchRow } from "@/components/Controls";
import { NeonButton } from "@/components/NeonButton";
import { ChannelBars } from "@/components/ChannelBars";
import { MuscleMap } from "@/components/MuscleMap";
import { EmgWaveformChart } from "@/components/charts/EmgWaveformChart";
import { DEFAULT_WS_URL } from "@/services/sources/bleConfig";
import { useEMGData, useSensorControl } from "@/state/SensorProvider";
import { COLORS, ZONE_STYLE, classifyZone } from "@/theme";
import { fmtClock } from "@/utils/format";

const SOURCE_OPTIONS = [
  { id: "mock" as const, label: "DEMO" },
  { id: "ble" as const, label: "BLE" },
  { id: "websocket" as const, label: "WIFI" },
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
    resetSession,
  } = useSensorControl();

  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);

  const emg = frame?.emg ?? 0;
  const zone = classifyZone(emg);
  const zoneColor = ZONE_STYLE[zone].color;

  return (
    <View className="flex-1 bg-bio-void" style={{ paddingTop: insets.top + 8 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[11px] font-bold tracking-[0.35em] text-emerald-400">
            Nimbus Nova
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

        <Animated.View
          entering={FadeInDown.springify().damping(16)}
          className="rounded-2xl border p-4"
          style={{ borderColor: `${zoneColor}44`, backgroundColor: `${zoneColor}0A` }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[9px] font-semibold tracking-[0.25em] text-slate-500">
                MUSCLE ACTIVATION
              </Text>
              <View className="mt-1 flex-row items-baseline">
                <HeroNumber value={emg.toFixed(1)} color={zoneColor} />
                <Text className="ml-1.5 font-mono text-sm" style={{ color: zoneColor }}>
                  %
                </Text>
              </View>
              <View
                className="mt-2 self-start rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${zoneColor}1E` }}
              >
                <Text
                  className="text-[9px] font-bold tracking-[0.2em]"
                  style={{ color: zoneColor }}
                >
                  {ZONE_STYLE[zone].label}
                </Text>
              </View>
            </View>
            <View className="w-[46%] pt-2">
              <ChannelBars frame={frame} />
            </View>
          </View>
        </Animated.View>

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
              LIVE EMG WAVEFORM
            </Text>
            <Text className="font-mono text-[10px] text-slate-600">10 Hz · 24 s</Text>
          </View>
          <EmgWaveformChart height={190} />
          <View className="mt-3 flex-row items-center justify-end gap-3">
            <LegendDot color={COLORS.amber} label="<35 UNDER" />
            <LegendDot color={COLORS.emerald} label="OPTIMAL" />
            <LegendDot color={COLORS.red} label=">85 RISK" />
          </View>
        </View>

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
              MUSCLE MAP · 4CH
            </Text>
            <Text className="font-mono text-[10px] text-slate-600">LIVE</Text>
          </View>
          <MuscleMap frame={frame} height={235} />
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

        <HardwarePanel
          mode={mode}
          wsUrl={wsUrl}
          setWsUrl={setWsUrl}
          onActivate={(m, url) => void activate(m, url ? { url } : undefined)}
          onToggleDemo={(v) => void activate(v ? "mock" : "ble")}
        />

        <NeonButton title="RESET SESSION METRICS" variant="ghost" onPress={resetSession} />
      </ScrollView>
    </View>
  );
}

function HeroNumber({ value, color }: { value: string; color: string }) {
  return (
    <View>
      <Text className="font-mono text-[52px] font-bold leading-[56px]" style={{ color }}>
        {value}
      </Text>
      <View
        className="absolute inset-x-1 bottom-2 h-5 rounded-full"
        style={{ backgroundColor: `${color}2E` }}
      />
    </View>
  );
}

function HardwarePanel({
  mode,
  wsUrl,
  setWsUrl,
  onActivate,
  onToggleDemo,
}: {
  mode: "mock" | "ble" | "websocket";
  wsUrl: string;
  setWsUrl: (v: string) => void;
  onActivate: (mode: "mock" | "ble" | "websocket", url?: string) => void;
  onToggleDemo: (v: boolean) => void;
}) {
  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
        HARDWARE LINK
      </Text>
      <View className="mt-3">
        <SegmentedControl options={SOURCE_OPTIONS} activeId={mode} onSelect={(m) => onActivate(m)} />
      </View>

      {mode === "websocket" && (
        <View className="mt-3 gap-2">
          <TextInput
            value={wsUrl}
            onChangeText={setWsUrl}
            placeholder="ws://192.168.4.1:81/"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 font-mono text-xs text-emerald-300"
          />
          <NeonButton title="CONNECT VIA WIFI" variant="cyan" onPress={() => onActivate("websocket", wsUrl)} />
        </View>
      )}

      {mode === "ble" && (
        <View className="mt-3">
          <NeonButton
            title="SCAN FOR ESP32 SUIT"
            variant="cyan"
            onPress={() => onActivate("ble")}
          />
          <Text className="mt-2 text-[10px] leading-4 text-slate-600">
            Scans for Nordic UART (6E400001...) devices named ESP32 / BioSuit. Requires a dev
            build — Expo Go cannot access BLE.
          </Text>
        </View>
      )}

      <SwitchRow
        label="Demo / Mock Data Mode"
        sublabel={
          mode === "mock"
            ? "Synthetic sinusoidal + spike generator at 100ms ticks"
            : "Switch on to disconnect from hardware"
        }
        value={mode === "mock"}
        onChange={onToggleDemo}
      />
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
