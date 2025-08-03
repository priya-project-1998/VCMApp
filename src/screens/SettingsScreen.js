import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const SettingsScreen = () => {
  const [storagePermission, setStoragePermission] = useState(true);
  const [locationPermission, setLocationPermission] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Permission</Text>

        {/* Storage Permission */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Storage Permission</Text>
          <Switch
            value={storagePermission}
            onValueChange={(value) => setStoragePermission(value)}
            thumbColor={storagePermission ? "#ff7e5f" : "#ccc"}
            trackColor={{ false: "#666", true: "#feb47b" }}
          />
        </View>

        {/* Location Permission */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Location Permission</Text>
          <Switch
            value={locationPermission}
            onValueChange={(value) => setLocationPermission(value)}
            thumbColor={locationPermission ? "#ff7e5f" : "#ccc"}
            trackColor={{ false: "#666", true: "#feb47b" }}
          />
        </View>

        {/* Notification Permission */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notification Permission</Text>
          <Switch
            value={notificationPermission}
            onValueChange={(value) => setNotificationPermission(value)}
            thumbColor={notificationPermission ? "#ff7e5f" : "#ccc"}
            trackColor={{ false: "#666", true: "#feb47b" }}
          />
        </View>

        {/* Camera Permission */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Camera Permission</Text>
          <Switch
            value={cameraPermission}
            onValueChange={(value) => setCameraPermission(value)}
            thumbColor={cameraPermission ? "#ff7e5f" : "#ccc"}
            trackColor={{ false: "#666", true: "#feb47b" }}
          />
        </View>

        {/* Microphone Permission */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Microphone Permission</Text>
          <Switch
            value={microphonePermission}
            onValueChange={(value) => setMicrophonePermission(value)}
            thumbColor={microphonePermission ? "#ff7e5f" : "#ccc"}
            trackColor={{ false: "#666", true: "#feb47b" }}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default SettingsScreen;
