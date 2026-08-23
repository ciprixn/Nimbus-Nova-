import { useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NeonButton } from "@/components/NeonButton";
import { EmgWaveformChart } from "@/components/charts/EmgWaveformChart";
import { useRecorder } from "@/hooks/useRecorder";
import { useSensorControl, useEMGData } from "@/state/SensorProvider";
import { COLORS } from "@/theme";
import { exportCsv, exportJson, guardExport, type SessionMeta } from "@/utils/sessionExport";
import { fmtClock } from "@/utils/format";

const SAMPLE_RATE_HZ = 10;

export function DataCollectorScreen() {
  const insets = useSafeAreaInsets();
  const recorder = useRecorder();
  const { sourceLabel } = useSensorControl();
  const { historyRef } = useEMGData();

  const recording = recorder.status === "recording";
  const hasData = recorder.pointCount > 0;

  const meta = useMemo<SessionMeta>(
    () => ({
      source: sourceLabel,
      exercise: "free-movement",
      startedAt: Date.now() - recorder.elapsedMs,
      durationMs: recorder.elapsedMs,
      sampleRateHz: SAMPLE_RATE_HZ,
      strideScore: recorder.strideScore
    }),
    // Recomputed lazily at export time via closures below.
    [sourceLabel, recorder.elapsedMs, recorder.strideScore]
  );

  const doExport = (kind: "json" | "csv") => {
    if (!hasData) {
      Alert.alert("Nothing to export", "Record some telemetry first.");
      return;
    }
    guardExport(() =>
      kind === "json"
        ? exportJson(meta, recorder.framesRef.current)
        : exportCsv(meta, recorder.framesRef.current)
    );
  };

  return (
    <View className="flex-1 bg-bio-void" style={{ paddingTop: insets.top + 8 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[11px] font-bold tracking-[0.35em] text-cyan-400">
            EXOSKELETON AI · DATA COLLECTOR
          </Text>
          <Text className="mt-1 font-mono text-[10px] text-slate-500">
            HIGH-FREQUENCY MOVEMENT TELEMETRY LOGGER
          </Text>
        </View>

        <View className="flex-row gap-3">
          <MetaTile label="ELAPSED" value={fmtClock(recorder.elapsedMs)} accent={COLORS.cyan} />
          <MetaTile
            label="DATA POINTS"
            value={recorder.pointCount.toLocaleString()}
            accent={COLORS.emerald}
          />
        </View>
        <View className="flex-row gap-3">
          <MetaTile label="SAMPLE RATE" value={`${SAMPLE_RATE_HZ} Hz`} accent={COLORS.rose} />
          <MetaTile
            label="STRIDE CONSISTENCY"
            value={
              recorder.strideScore === null ? "--" : `${recorder.strideScore}%`
            }
            accent={COLORS.amber}
            footer="peak interval regularity"
          />
        </View>

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
              RECORDING MONITOR
            </Text>
            <StatusChip status={recorder.status} />
          </View>
          <EmgWaveformChart height={150} />
          <Text className="mt-2 font-mono text-[9px] text-slate-600">
            buffer: {historyRef.current.length} samples in live window
          </Text>
        </View>

        <View className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <Text className="text-[11px] font-bold tracking-[0.22em] text-slate-300">
            TELEMETRY RECORDING
          </Text>
          <View className="mt-3 flex-row gap-2">
            {recording ? (
              <NeonButton title="PAUSE" variant="cyan" onPress={recorder.pause} />
            ) : (
              <NeonButton
                title={
                  recorder.status === "paused"
                    ? "RESUME"
                    : recorder.status === "stopped"
                      ? "RESTART"
                      : "START TELEMETRY RECORDING"
                }
                variant="primary"
                onPress={() => {
                  if (recorder.status === "paused") recorder.resume();
                  else recorder.start();
                }}
              />
            )}
            <NeonButton title="STOP" variant="danger" onPress={recorder.stop} disabled={!recording && recorder.status !== "paused"} />
          </View>

          <View className="mt-2 flex-row gap-2">
            <NeonButton title="EXPORT JSON" variant="cyan" onPress={() => doExport("json")} disabled={!hasData} />
            <NeonButton title="EXPORT CSV" variant="cyan" onPress={() => doExport("csv")} disabled={!hasData} />
          </View>
          <View className="mt-2 flex-row gap-2">
            <NeonButton
              title="CLEAR SESSION DATA"
              variant="ghost"
              onPress={() => {
                Alert.alert("Clear session", "Discard all recorded frames?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: recorder.reset }
                ]);
              }}
              disabled={!hasData && recorder.status === "idle"}
            />
          </View>

          <Text className="mt-3 text-[10px] leading-4 text-slate-600">
            Frames are buffered locally and exported as a versioned session bundle
            (JSON) or flat table (CSV) ready for model-training pipelines.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MetaTile({
  label,
  value,
  accent,
  footer
}: {
  label: string;
  value: string;
  accent: string;
  footer?: string;
}) {
  return (
    <View className="flex-1 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <Text className="text-[9px] font-semibold tracking-[0.22em] text-slate-500">{label}</Text>
      <Text className="mt-1.5 font-mono text-lg font-bold" style={{ color: accent }}>
        {value}
      </Text>
      {footer ? <Text className="text-[9px] text-slate-600">{footer}</Text> : null}
    </View>
  );
}

function StatusChip({ status }: { status: ReturnType<typeof useRecorder>["status"] }) {
  const map = {
    idle: { t: "IDLE", c: COLORS.muted },
    recording: { t: "\u25CF REC", c: COLORS.red },
    paused: { t: "\u2016 PAUSED", c: COLORS.amber },
    stopped: { t: "\u2713 SAVED", c: COLORS.emerald }
  }[status];
  return (
    <Text className="font-mono text-[10px] font-bold tracking-widest" style={{ color: map.c }}>
      {map.t}
    </Text>
  );
}

export default DataCollectorScreen;
