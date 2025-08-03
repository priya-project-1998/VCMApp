import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const TermsConditionScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>VCM - Terms & Conditions</Text>

      <Text style={styles.section}>
        Welcome to VCM! These Terms & Conditions govern your use of the VCM mobile application.
        By downloading or using this app, you agree to these terms.
      </Text>

      <Text style={styles.subHeading}>1. Eligibility</Text>
      <Text style={styles.section}>
        This app is strictly for users aged 18 years and above, residing in India.
        By using VCM, you confirm that you meet this age requirement.
      </Text>

      <Text style={styles.subHeading}>2. Nature of the App</Text>
      <Text style={styles.section}>
        VCM is a platform for organizing and participating in racing events across
        different parts of India. Events may include:
        {"\n"}• Car Racing
        {"\n"}• Bike Racing
        {"\n"}• Walking/Marathon Events
        {"\n"}
        Each event offers participants the chance to win exciting prizes and gain
        amazing real-life experiences.
      </Text>

      <Text style={styles.subHeading}>3. User Responsibilities</Text>
      <Text style={styles.section}>
        • You agree to provide accurate personal details during signup.
        {"\n"}• You must follow all event safety guidelines and instructions.
        {"\n"}• You must not use the app for any illegal activities.
      </Text>

      <Text style={styles.subHeading}>4. Prizes & Rewards</Text>
      <Text style={styles.section}>
        Prize distribution depends on the event rules and may vary by location.
        VCM is not liable for any issues arising from third-party prize sponsors.
      </Text>

      <Text style={styles.subHeading}>5. Safety Disclaimer</Text>
      <Text style={styles.section}>
        Participation in racing events involves inherent risks. By joining an event,
        you accept full responsibility for your safety and agree that VCM will not
        be held liable for any injuries or damages.
      </Text>

      <Text style={styles.subHeading}>6. Changes to Terms</Text>
      <Text style={styles.section}>
        VCM reserves the right to update these terms at any time. Users will be
        notified of major changes via the app.
      </Text>

      <Text style={styles.subHeading}>7. Contact Us</Text>
      <Text style={styles.section}>
        For any questions or concerns regarding these terms, please contact our
        support team via the in-app Help section.
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

export default TermsConditionScreen;
