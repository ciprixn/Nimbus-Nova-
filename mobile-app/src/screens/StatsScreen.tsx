import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistici</Text>
      <Text style={styles.subtitle}>Aici vei vedea istoric și analize ale antrenamentelor.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#09090B" },
  title: { fontSize: 28, fontWeight: "bold", color: "#34D399", marginBottom: 12 },
  subtitle: { fontSize: 16, color: "#E4E4E7", textAlign: "center", paddingHorizontal: 24 },
});