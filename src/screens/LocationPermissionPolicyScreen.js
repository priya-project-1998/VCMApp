import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

const LocationPermissionPolicyScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>VCM - Location Permission Policy</Text>

      <Text style={styles.section}>
        The VCM app requires access to your device’s location services to provide
        you with accurate event information, location-based recommendations, and
        better user experience.
      </Text>

      <Text style={styles.subHeading}>1. Why We Collect Location Data</Text>
      <Text style={styles.section}>
        • To help you find racing events near your current location.
        {"\n"}• To provide location-based notifications and updates.
        {"\n"}• To ensure accurate event start points and tracking.
      </Text>

      <Text style={styles.subHeading}>2. How Location Data is Used</Text>
      <Text style={styles.section}>
        Your location information is used only within the app to:
        {"\n"}• Show nearby events.
        {"\n"}• Guide you to event venues.
        {"\n"}• Enable safety and security features during events.
      </Text>

      <Text style={styles.subHeading}>3. Data Storage & Security</Text>
      <Text style={styles.section}>
        • We do not store your real-time location permanently.
        {"\n"}• Location data is processed temporarily to provide services and is not
        shared with unauthorized third parties.
      </Text>

      <Text style={styles.subHeading}>4. Your Control Over Location Access</Text>
      <Text style={styles.section}>
        • You can allow or deny location permissions in your device settings.
        {"\n"}• Denying location permissions may limit certain app features such as
        nearby event recommendations.
      </Text>

      <Text style={styles.subHeading}>5. Compliance</Text>
      <Text style={styles.section}>
        VCM complies with applicable privacy laws in India regarding the use of
        personal and location data. We request location access only when it is
        necessary for app functionality.
      </Text>

      <Text style={styles.subHeading}>6. Contact Us</Text>
      <Text style={styles.section}>
        If you have any questions regarding our location permission policy, please
        reach out to us via the in-app Help section.
      </Text>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} VCM. All Rights Reserved.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff7e5f",
    marginBottom: 15,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#feb47b",
    marginTop: 15,
    marginBottom: 5,
  },
  section: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
});

export default LocationPermissionPolicyScreen;
