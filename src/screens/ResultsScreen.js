import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const ResultsScreen = () => {
  const [selectedResult, setSelectedResult] = useState(null);

  // Dummy Completed Event Results
  const resultsData = [
    {
      id: 1,
      name: "City Car Race - July 2025",
      checkpoints: [
        { sr: 1, name: "Start", time: "11:27:52" },
        { sr: 2, name: "Checkpoint 01", time: "11:29:47" },
        { sr: 3, name: "Checkpoint 02", time: "02:27:59" },
        { sr: 4, name: "Finish", time: "05:02:02" },
      ],
      performance: {
        startTime: "11:27:52",
        endTime: "05:02:02",
        checkpoints: 20,
        bonus: 55,
        speedPenalty: 0,
        timeTaken: "01:47:10",
      },
    },
    {
      id: 2,
      name: "Mountain Bike Challenge - June 2025",
      checkpoints: [
        { sr: 1, name: "Start", time: "10:10:00" },
        { sr: 2, name: "Checkpoint 01", time: "10:45:12" },
        { sr: 3, name: "Checkpoint 02", time: "11:15:30" },
        { sr: 4, name: "Finish", time: "12:05:00" },
      ],
      performance: {
        startTime: "10:10:00",
        endTime: "12:05:00",
        checkpoints: 15,
        bonus: 72,
        speedPenalty: 2,
        timeTaken: "01:55:00",
      },
    },
    {
      id: 3,
      name: "Walking Marathon - May 2025",
      checkpoints: [
        { sr: 1, name: "Start", time: "08:00:00" },
        { sr: 2, name: "Checkpoint 01", time: "08:30:10" },
        { sr: 3, name: "Checkpoint 02", time: "09:15:45" },
        { sr: 4, name: "Finish", time: "10:40:20" },
      ],
      performance: {
        startTime: "08:00:00",
        endTime: "10:40:20",
        checkpoints: 10,
        bonus: 40,
        speedPenalty: 0,
        timeTaken: "02:40:20",
      },
    },
    {
      id: 4,
      name: "Speed Rally - April 2025",
      checkpoints: [
        { sr: 1, name: "Start", time: "15:00:00" },
        { sr: 2, name: "Checkpoint 01", time: "15:25:42" },
        { sr: 3, name: "Checkpoint 02", time: "15:50:12" },
        { sr: 4, name: "Finish", time: "16:30:00" },
      ],
      performance: {
        startTime: "15:00:00",
        endTime: "16:30:00",
        checkpoints: 12,
        bonus: 65,
        speedPenalty: 5,
        timeTaken: "01:30:00",
      },
    },
    {
      id: 5,
      name: "City Cycling - March 2025",
      checkpoints: [
        { sr: 1, name: "Start", time: "07:45:00" },
        { sr: 2, name: "Checkpoint 01", time: "08:20:15" },
        { sr: 3, name: "Checkpoint 02", time: "09:05:33" },
        { sr: 4, name: "Finish", time: "09:50:00" },
      ],
      performance: {
        startTime: "07:45:00",
        endTime: "09:50:00",
        checkpoints: 14,
        bonus: 50,
        speedPenalty: 0,
        timeTaken: "02:05:00",
      },
    },
  ];

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {!selectedResult && (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {resultsData.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.listItem}
                onPress={() => setSelectedResult(result)}
              >
                <Text style={styles.listText}>{result.name}</Text>
                <Text style={styles.subText}>Tap to view details</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedResult && (
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedResult(null)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>{selectedResult.name}</Text>

            {selectedResult.checkpoints.map((cp) => (
              <View key={cp.sr} style={styles.checkpointRow}>
                <Text style={styles.checkpointText}>{cp.sr}</Text>
                <Text style={styles.checkpointText}>{cp.name}</Text>
                <Text style={styles.checkpointText}>{cp.time}</Text>
              </View>
            ))}

            <Text style={[styles.heading, { marginTop: 20 }]}>Your Performance</Text>
            <Text style={styles.subText}>Start Time: {selectedResult.performance.startTime}</Text>
            <Text style={styles.subText}>End Time: {selectedResult.performance.endTime}</Text>
            <Text style={styles.subText}>Checkpoints: {selectedResult.performance.checkpoints}</Text>
            <Text style={styles.subText}>Bonus: {selectedResult.performance.bonus}</Text>
            <Text style={styles.subText}>Speed Penalty: {selectedResult.performance.speedPenalty}</Text>
            <Text style={styles.subText}>Time Taken: {selectedResult.performance.timeTaken}</Text>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  listContainer: { paddingBottom: 20 },
  listItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  listText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  subText: { color: "#ccc", fontSize: 14 },
  detailsContainer: { padding: 10 },
  backButton: { marginBottom: 10 },
  backText: { color: "#ff7e5f", fontWeight: "bold" },
  heading: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  checkpointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
  },
  checkpointText: { color: "#fff", flex: 1, textAlign: "center" },
});

export default ResultsScreen;
