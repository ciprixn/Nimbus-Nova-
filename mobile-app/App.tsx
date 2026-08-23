import "react-native-reanimated";
import "./global.css";

import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";
import { SensorProvider } from "@/state/SensorProvider";

const BioTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#34D399",
    background: "#020617",
    card: "#0B1220",
    border: "#1E293B",
    notification: "#34D399"
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SensorProvider>
        <NavigationContainer theme={BioTheme}>
          <StatusBar style="light" backgroundColor="#020617" />
          <RootNavigator />
        </NavigationContainer>
      </SensorProvider>
    </SafeAreaProvider>
  );
}
