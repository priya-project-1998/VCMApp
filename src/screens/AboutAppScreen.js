import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const AboutAppScreen = () => {
  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>About</Text>

        <Text style={styles.paragraph}>
          Welcome to <Text style={styles.highlight}>VCM</Text> – your ultimate platform for
          organizing, participating, and experiencing racing events across India. Whether it’s
          <Text style={styles.highlight}> car races, bike challenges, or walking marathons</Text>,
          VCM brings thrilling competitions and unique experiences to your fingertips.
        </Text>

        <Text style={styles.paragraph}>
          The app is designed for <Text style={styles.highlight}>18+ users in India</Text> who
          are passionate about speed, endurance, and adventure. Participants can join events in
          various locations, compete for exciting prizes, and enjoy a professional event tracking
          experience.
        </Text>

        <Text style={styles.subHeading}>Key Features:</Text>
        <Text style={styles.listItem}>• Create and manage events as an organiser</Text>
        <Text style={styles.listItem}>• View upcoming and completed event details</Text>
        <Text style={styles.listItem}>• Live checkpoints and performance tracking</Text>
        <Text style={styles.listItem}>• User profile management with photo upload</Text>
        <Text style={styles.listItem}>• Rate, review, and provide feedback on events</Text>
        <Text style={styles.listItem}>• Share invitations with friends via WhatsApp or other apps</Text>
        <Text style={styles.listItem}>• Search events and view past results</Text>
        <Text style={styles.listItem}>• Manage permissions for storage, location, and notifications</Text>

        <Text style={styles.subHeading}>Our Mission:</Text>
        <Text style={styles.paragraph}>
          At VCM, we aim to create a community of motorsport and fitness enthusiasts by providing
          a reliable, easy-to-use platform for event creation and participation. Our goal is to
          ensure every event delivers <Text style={styles.highlight}>fair competition, fun, and
          unforgettable experiences</Text>.
        </Text>

        <Text style={styles.footer}>
          Version 1.0.0 | Developed by VCM Team © {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#feb47b",
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: "#ccc",
    marginBottom: 10,
    lineHeight: 22,
  },
  highlight: { color: "#ff7e5f", fontWeight: "bold" },
  listItem: {
    fontSize: 15,
    color: "#ccc",
    marginLeft: 10,
    marginBottom: 5,
  },
  footer: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
});

export default AboutAppScreen;
