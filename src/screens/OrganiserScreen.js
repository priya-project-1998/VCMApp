import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const OrganiserScreen = () => {
  const [viewTab, setViewTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [upcomingEvents] = useState([
    {
      id: 1,
      name: "City Car Race",
      place: "Indore, Madhya Pradesh",
      eventType: "Car",
      members: 20,
      startDateTime: "2025-08-10 09:00",
      applicationDeadline: "2025-08-05 23:59",
      comment: "Helmet required",
    },
  ]);

  const completedEvents = [
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
        bonus: Math.floor(Math.random() * 100),
        speedPenalty: 0,
        timeTaken: "01:47:10",
      },
    },
  ];

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* View Tabs */}
        {!selectedEvent && (
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, viewTab === "upcoming" && styles.activeTab]}
              onPress={() => setViewTab("upcoming")}
            >
              <Text style={styles.tabText}>Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, viewTab === "completed" && styles.activeTab]}
              onPress={() => setViewTab("completed")}
            >
              <Text style={styles.tabText}>Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Event List */}
        {!selectedEvent && (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {viewTab === "upcoming" &&
              upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.listItem}
                  onPress={() => setSelectedEvent(event)}
                >
                  <Text style={styles.listText}>{event.name}</Text>
                  <Text style={styles.subText}>
                    Place: {event.place} | Type: {event.eventType}
                  </Text>
                  <Text style={styles.subText}>Start: {event.startDateTime}</Text>
                  <Text style={styles.subText}>
                    Application Deadline: {event.applicationDeadline}
                  </Text>
                </TouchableOpacity>
              ))}
            {viewTab === "completed" &&
              completedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.listItem}
                  onPress={() => setSelectedEvent(event)}
                >
                  <Text style={styles.listText}>{event.name}</Text>
                  <Text style={styles.subText}>Tap to view details</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}

        {/* Event Details */}
        {selectedEvent && (
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedEvent(null)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>{selectedEvent.name}</Text>

            {viewTab === "upcoming" && (
              <>
                <Text style={styles.subText}>Place: {selectedEvent.place}</Text>
                <Text style={styles.subText}>Type: {selectedEvent.eventType}</Text>
                <Text style={styles.subText}>Members: {selectedEvent.members}</Text>
                <Text style={styles.subText}>Start: {selectedEvent.startDateTime}</Text>
                <Text style={styles.subText}>
                  Application Deadline: {selectedEvent.applicationDeadline}
                </Text>
                {selectedEvent.comment ? (
                  <Text style={styles.subText}>Comment: {selectedEvent.comment}</Text>
                ) : null}
              </>
            )}

            {viewTab === "completed" && (
              <>
                {selectedEvent.checkpoints.map((cp) => (
                  <View key={cp.sr} style={styles.checkpointRow}>
                    <Text style={styles.checkpointText}>{cp.sr}</Text>
                    <Text style={styles.checkpointText}>{cp.name}</Text>
                    <Text style={styles.checkpointText}>{cp.time}</Text>
                  </View>
                ))}
                <Text style={[styles.heading, { marginTop: 20 }]}>Your Performance</Text>
                <Text style={styles.subText}>
                  Start Time: {selectedEvent.performance.startTime}
                </Text>
                <Text style={styles.subText}>
                  End Time: {selectedEvent.performance.endTime}
                </Text>
                <Text style={styles.subText}>
                  Checkpoints: {selectedEvent.performance.checkpoints}
                </Text>
                <Text style={styles.subText}>
                  Bonus: {selectedEvent.performance.bonus}
                </Text>
                <Text style={styles.subText}>
                  Speed Penalty: {selectedEvent.performance.speedPenalty}
                </Text>
                <Text style={styles.subText}>
                  Time Taken: {selectedEvent.performance.timeTaken}
                </Text>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  tabRow: { flexDirection: "row", marginBottom: 10 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeTab: { backgroundColor: "#ff7e5f" },
  tabText: { color: "#fff", fontWeight: "bold" },
  heading: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
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
  checkpointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
  },
  checkpointText: { color: "#fff", flex: 1, textAlign: "center" },
});

export default OrganiserScreen;
