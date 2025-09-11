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

import EventService from "../services/apiService/event_service";
import EventModel from "../model/EventModel";

const OrganiserScreen = () => {
  const [viewTab, setViewTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // API call
  const fetchEvents = useCallback(async () => {
    setApiError("");
    setLoading(true);
    try {
      const res = await EventService.getEvents(); // should return {status, events: []}
      console.log("Response Data:", res.status);
      console.log("Response Data:", res.data);
      if (res.status === true) {
        const allEvents = res.data.events.map((e) => new EventModel(e));
        setUpcomingEvents(allEvents.filter((ev) => !ev.isCompleted));
        setCompletedEvents(allEvents.filter((ev) => ev.isCompleted));
      } else {
        setUpcomingEvents([]);
        setCompletedEvents([]);
        setApiError("Failed to load events");
      }
    } catch (err) {
      setUpcomingEvents([]);
      setCompletedEvents([]);
      setApiError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const renderListItem = (event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.listItem}
      onPress={() => setSelectedEvent(event)}
    >
      <Text style={styles.listText}>{event.name}</Text>
      <Text style={styles.subText}>Place: {event.venue}</Text>
      <Text style={styles.subText}>Start: {event.startDate}</Text>
      <Text style={styles.subText}>End: {event.endDate}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Loader overlay */}
        {loading && (
          <View style={styles.loaderContainer}>
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
              (upcomingEvents.length > 0 ? (
                upcomingEvents.map(renderListItem)
              ) : (
                !loading && <Text style={styles.subText}>No upcoming events found.</Text>
              ))}

            {viewTab === "completed" &&
              (completedEvents.length > 0 ? (
                completedEvents.map(renderListItem)
              ) : (
                !loading && <Text style={styles.subText}>No completed events found.</Text>
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
            <Text style={styles.subText}>ID: {selectedEvent.id}</Text>
            <Text style={styles.subText}>Venue: {selectedEvent.venue}</Text>
            <Text style={styles.subText}>Description: {selectedEvent.desc}</Text>
            <Text style={styles.subText}>Start: {selectedEvent.startDate}</Text>
            <Text style={styles.subText}>End: {selectedEvent.endDate}</Text>
            <Text style={styles.subText}>Organised By: {selectedEvent.organisedBy}</Text>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // dim background
    zIndex: 10,
  },
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
  heading: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  backButton: { marginBottom: 10 },
  backText: { color: "#ff7e5f", fontWeight: "bold" },
});

export default OrganiserScreen;
