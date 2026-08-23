import { useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import {
  createBottomTabNavigator,
  type BottomTabBarProps
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

import { DashboardScreen } from "@/screens/DashboardScreen";
import { FormGuardScreen } from "@/screens/FormGuardScreen";
import { DataCollectorScreen } from "@/screens/DataCollectorScreen";

export type RootTabParamList = {
  Dashboard: undefined;
  FormGuard: undefined;
  Collector: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const LABELS: Record<keyof RootTabParamList, string> = {
  Dashboard: "TELEMETRY",
  FormGuard: "FORM GUARD",
  Collector: "DATA LAB"
};

function PulseIcon({ active }: { active: boolean }) {
  const c = active ? "#34D399" : "#475569";
  return (
    <View className="flex-row items-end gap-[2px]" style={{ height: 16 }}>
      {[8, 16, 11].map((h, i) => (
        <View key={i} style={{ height: h, width: 3, backgroundColor: c }} className="rounded-full" />
      ))}
    </View>
  );
}

function LensIcon({ active }: { active: boolean }) {
  const c = active ? "#34D399" : "#475569";
  return (
    <View
      style={{ height: 18, width: 18, borderColor: c }}
      className="items-center justify-center rounded-full border-2"
    >
      <View style={{ height: 6, width: 6, backgroundColor: c }} className="rounded-full" />
    </View>
  );
}

function GridIcon({ active }: { active: boolean }) {
  const c = active ? "#22D3EE" : "#475569";
  return (
    <View className="flex-row flex-wrap" style={{ width: 18 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ height: 8, width: 8, borderColor: c }} className="m-0.5 rounded-[2px] border" />
      ))}
    </View>
  );
}

const ICONS: Record<keyof RootTabParamList, (p: { active: boolean }) => JSX.Element> = {
  Dashboard: PulseIcon,
  FormGuard: LensIcon,
  Collector: GridIcon
};

function TabButton({
  routeName,
  label,
  active,
  onPress
}: {
  routeName: keyof RootTabParamList;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const Icon = ICONS[routeName];
  const underline = useSharedValue(0);

  useEffect(() => {
    underline.value = withSpring(active ? 1 : 0, { damping: 18, stiffness: 220 });
  }, [active, underline]);

  const underlineStyle = useAnimatedStyle(() => ({
    opacity: underline.value,
    transform: [{ scaleX: underline.value }]
  }));

  return (
    <Pressable onPress={onPress} className="flex-1 items-center gap-1 pt-1">
      <Icon active={active} />
      <Text
        className={
          "text-[8px] font-bold tracking-[0.18em] " +
          (active ? "text-emerald-400" : "text-slate-500")
        }
      >
        {label}
      </Text>
      <Animated.View
        style={underlineStyle}
        className="h-[2px] w-7 rounded-full bg-emerald-400"
      />
    </Pressable>
  );
}

function BioTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row border-t border-slate-800 bg-slate-950/95"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 8 }}
    >
      {state.routes.map((route, index) => {
        const active = state.index === index;
        return (
          <TabButton
            key={route.key}
            routeName={route.name as keyof RootTabParamList}
            label={LABELS[route.name as keyof RootTabParamList]}
            active={active}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}
    </View>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BioTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#020617" }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="FormGuard" component={FormGuardScreen} />
      <Tab.Screen name="Collector" component={DataCollectorScreen} />
    </Tab.Navigator>
  );
}
