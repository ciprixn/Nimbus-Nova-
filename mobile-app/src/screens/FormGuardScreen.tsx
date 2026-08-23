import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

import { FeedbackBadge } from "@/components/FeedbackBadge";
import { NeonButton } from "@/components/NeonButton";
import { StrainGauge } from "@/components/StrainGauge";
import { useEMGData } from "@/state/SensorProvider";
import { classifyZone } from "@/theme";
import type { Zone } from "@/theme";

const EXERCISES = ["BICEP CURL", "SQUAT", "DEADLIFT"] as const;
type Exercise = (typeof EXERCISES)[number];

export function FormGuardScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const { frame } = useEMGData();

  const [exercise, setExercise] = useState<Exercise>("BICEP CURL");
  const [reps, setReps] = useState(0);

  const emg = frame?.emg ?? 0;
  const zone: Zone = classifyZone(emg);

  const armedRef = useRef(true);
  useEffect(() => {
    if (emg < 40) armedRef.current = true;
    else if (armedRef.current && emg > 70) {
      armedRef.current = false;
      setReps((r) => r + 1);
    }
  }, [emg]);

  useEffect(() => {
    setReps(0);
    armedRef.current = true;
  }, [exercise]);

  const dangerOpacity = useSharedValue(0);
  useEffect(() => {
    if (zone === "danger") {
      dangerOpacity.value = withRepeat(
        withTiming(0.9, { duration: 380 }),
        -1,
        true
      );
    } else {
      cancelAnimation(dangerOpacity);
      dangerOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [zone, dangerOpacity]);

  const dangerStyle = useAnimatedStyle(() => ({
    opacity: dangerOpacity.value
  }));

  if (!permission) {
    return <Centered text="Loading camera module..." />;
  }

  if (!permission.granted) {
    return (
      <Centered
        text="Camera access is required for posture analysis. EMG feedback keeps running either way."
        action={{ label: "ENABLE CAMERA", onPress: () => void requestPermission() }}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        active={isFocused}
      />

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, dangerStyle]}
        className="border-[3px] border-red-500"
      />

      <ViewfinderOverlay />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-row items-start justify-between px-4 pt-3">
          <View>
            <Text className="text-[10px] font-bold tracking-[0.3em] text-emerald-400">
              AI FORM GUARD
            </Text>
            <Text className="mt-1 font-mono text-[10px] text-slate-400">
              TARGET · {exercise}
            </Text>
          </View>
          <StrainGauge value={emg} size={104} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <FeedbackBadge zone={zone} />
        </View>

        <View className="gap-3 px-4 pb-4">
          <View className="flex-row items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/80 px-4 py-2.5">
            <Text className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              REPS DETECTED
            </Text>
            <Text className="font-mono text-lg font-bold text-emerald-400">{reps}</Text>
          </View>

          <View className="flex-row gap-2">
            {EXERCISES.map((ex) => {
              const active = ex === exercise;
              return (
                <Text
                  key={ex}
                  onPress={() => setExercise(ex)}
                  className={
                    "flex-1 rounded-lg border py-2 text-center text-[9px] font-bold tracking-widest " +
                    (active
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-700 bg-slate-950/80 text-slate-500")
                  }
                >
                  {ex}
                </Text>
              );
            })}
          </View>

          <NeonButton
            title="RESET REPS"
            variant="ghost"
            onPress={() => {
              setReps(0);
              armedRef.current = true;
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function ViewfinderOverlay() {
  const scan = useSharedValue(0);

  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 2400 }), -1);
  }, [scan]);

  const scanStyle = useAnimatedStyle(() => ({
    top: `${10 + scan.value * 80}%`,
    opacity: 0.55 * Math.sin(Math.PI * scan.value)
  }));

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {[
        "left-4 top-24 border-l-2 border-t-2",
        "right-4 top-24 border-r-2 border-t-2",
        "left-4 bottom-40 border-b-2 border-l-2",
        "right-4 bottom-40 border-b-2 border-r-2"
      ].map((cls) => (
        <View key={cls} className={`absolute h-10 w-10 rounded-md border-emerald-400/70 ${cls}`} />
      ))}
      <Animated.View
        style={scanStyle}
        className="absolute inset-x-8 h-[2px] rounded-full bg-emerald-400/70"
      />
    </View>
  );
}

function Centered({
  text,
  action
}: {
  text: string;
  action?: { label: string; onPress: () => void };
}) {  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bio-void px-8">
      <Text className="text-center text-sm leading-5 text-slate-400">{text}</Text>
      {action ? (
        <View className="w-full px-4">
          <NeonButton title={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

export default FormGuardScreen;
