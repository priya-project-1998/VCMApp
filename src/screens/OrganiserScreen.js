// src/screens/OrganiserScreen.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

// ⬇️ Named functions from your service (as we discussed)
import EventService from "../services/apiService/event_service";

const OrganiserScreen = () => {
  const [viewTab, setViewTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);    // upcoming events from API
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ✅ Completed — DO NOT TOUCH (kept exactly as-is)
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

  // ---------- Helpers ----------
  const toId = (e) => e?.id ?? e?._id ?? e?.event_id ?? String(Math.random());

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleString();
    } catch {
      return String(value);
    }
  };

  // List-item mapping (backend → UI fields you already use)
  const normalizeEventListItem = (e) => ({
    id: toId(e),
    name: e?.name ?? "Untitled Event",
    place: e?.venue ?? "-",
    eventType: Array.isArray(e?.category) ? e.category.join(", ") : e?.category ?? "-",
    members: Number(e?.competitor) || 0,
    startDateTime: formatDateTime(e?.start_date),
    applicationDeadline: formatDateTime(e?.end_date),
    comment: e?.comment ?? "",
  });

  // Detail mapping (keep same UI keys so details view renders without changes)
  const normalizeEventDetail = (e) => ({
    id: toId(e),
    name: e?.name ?? "Untitled Event",
    place: e?.venue ?? "-",
    eventType: Array.isArray(e?.category) ? e.category.join(", ") : e?.category ?? "-",
    members: Number(e?.competitor) || 0,
    startDateTime: formatDateTime(e?.start_date),
    applicationDeadline: formatDateTime(e?.end_date),
    comment: e?.comment ?? "",
    // You can keep extra raw fields here if needed in future:
    raw: e,
  });

  // ---------- API Calls ----------
  const fetchEvents = useCallback(async () => {
    setApiError("");
    setLoading(true);
    try {
      const res = await EventService.getEvents(); // ApiResponse pattern
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setEvents(list.map(normalizeEventListItem));
      } else {
        setEvents([]);
        setApiError(res?.message || "Failed to load events");
        console.log("Failed to load events:", res?.code, res?.message);
      }
    } catch (err) {
      setEvents([]);
      setApiError(err?.message || "Network error");
      console.log("Failed to load events (catch):", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleEvent = useCallback(async (eventId) => {
    setApiError("");
    setLoading(true);
    try {
      const res = await EventService.getEventDetails(eventId); // ApiResponse pattern
      if (res?.success && res?.data) {
        setSelectedEvent(normalizeEventDetail(res.data));
      } else {
        setApiError(res?.message || "Failed to load event detail");
        console.log("Failed to load event detail:", res?.code, res?.message);
      }
    } catch (err) {
      setApiError(err?.message || "Network error");
      console.log("Failed to load event detail (catch):", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Re-render on focus (drawer/tab/back navigation) ----------
  useFocusEffect(
    useCallback(() => {
      // Screen comes into focus → refresh upcoming events,
      // keep current tab & selection as-is unless it’s a completed item.
      if (viewTab === "upcoming") {
        fetchEvents();
      }
      return () => {
        // cleanup (optional)
      };
    }, [viewTab, fetchEvents])
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {loading && (
          <View style={{ paddingVertical: 8 }}>
            <ActivityIndicator size="large" color="#ff7e5f" />
          </View>
        )}
        {!!apiError && !selectedEvent && (
          <Text style={[styles.subText, { color: "#ffb3a1", marginBottom: 8 }]}>
            {apiError}
          </Text>
        )}

        {/* Tabs */}
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
              (events.length > 0 ? (
                events.map((event) => (
                  <TouchableOpacity
                    key={String(event.id)}
                    style={styles.listItem}
                    onPress={() => fetchSingleEvent(event.id)}
                  >
                    <Text style={styles.listText}>{event.name}</Text>
                    <Text style={styles.subText}>Place: {event.place}</Text>
                    <Text style={styles.subText}>Type: {event.eventType}</Text>
                    <Text style={styles.subText}>Start: {event.startDateTime}</Text>
                    <Text style={styles.subText}>
                      Application Deadline: {event.applicationDeadline}
                    </Text>
                    {!!event.comment && (
                      <Text style={styles.subText}>Comment: {event.comment}</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                !loading && <Text style={styles.subText}>No upcoming events found.</Text>
              ))}

            {viewTab === "completed" &&
              completedEvents.map((event) => (
                <TouchableOpacity
                  key={String(event.id)}
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

            {viewTab === "completed" && selectedEvent.checkpoints && (
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





/* import React, { useState } from "react";
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

export default OrganiserScreen; */
