import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const NotificationsScreen = () => {
  const notifications = [
    {
      id: 1,
      title: "Event Reminder",
      message: "Your event 'City Car Race' starts tomorrow at 9:00 AM.",
      time: "2025-08-02 18:30",
    },
    {
      id: 2,
      title: "Result Published",
      message: "Results for 'Mountain Bike Challenge' are now live.",
      time: "2025-08-01 14:20",
    },
    {
      id: 3,
      title: "New Event Available",
      message: "A new event 'Walking Marathon' is now open for registration.",
      time: "2025-07-30 09:15",
    },
    {
      id: 4,
      title: "Registration Closing Soon",
      message: "Only 2 days left to register for 'Speed Rally'.",
      time: "2025-07-28 17:00",
    },
    {
      id: 5,
      title: "Event Update",
      message: "'City Cycling' start time has been changed to 8:00 AM.",
      time: "2025-07-25 11:45",
    },
    {
      id: 6,
      title: "Special Bonus",
      message: "You have earned a bonus of 50 points in 'Offroad Car Rally'.",
      time: "2025-07-20 10:05",
    },
  ];

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.notificationCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  notificationCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  message: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "right",
  },
});

export default NotificationsScreen;
