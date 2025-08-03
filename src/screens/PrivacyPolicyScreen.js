import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>VCM - Privacy Policy</Text>

      <Text style={styles.section}>
        Your privacy is important to us. This Privacy Policy explains how VCM
        collects, uses, and protects your personal information when you use our app.
        By using VCM, you agree to the practices described in this policy.
      </Text>

      <Text style={styles.subHeading}>1. Information We Collect</Text>
      <Text style={styles.section}>
        • Personal details you provide during signup (name, email, username, mobile).
        {"\n"}• Profile photo you upload.
        {"\n"}• Event participation details.
        {"\n"}• Device and usage data to improve our services.
      </Text>

      <Text style={styles.subHeading}>2. How We Use Your Information</Text>
      <Text style={styles.section}>
        • To create and manage your VCM account.
        {"\n"}• To register you for racing events.
        {"\n"}• To communicate important event updates and notifications.
        {"\n"}• To improve app performance and user experience.
      </Text>

      <Text style={styles.subHeading}>3. Data Sharing</Text>
      <Text style={styles.section}>
        VCM does not sell your personal data to third parties. We may share your
        information with trusted event organizers and partners strictly for the
        purpose of conducting events and awarding prizes.
      </Text>

      <Text style={styles.subHeading}>4. Data Security</Text>
      <Text style={styles.section}>
        We implement reasonable security measures to protect your personal
        information. However, no method of electronic storage is 100% secure.
      </Text>

      <Text style={styles.subHeading}>5. Your Rights</Text>
      <Text style={styles.section}>
        • You can update your profile information anytime in the Profile section.
        {"\n"}• You may request deletion of your account by contacting support.
        {"\n"}• You can control notification preferences in your device settings.
      </Text>

      <Text style={styles.subHeading}>6. Children's Privacy</Text>
      <Text style={styles.section}>
        VCM is strictly for users aged 18+ in India. We do not knowingly collect
        personal information from minors.
      </Text>

      <Text style={styles.subHeading}>7. Changes to Privacy Policy</Text>
      <Text style={styles.section}>
        We may update this Privacy Policy from time to time. Any significant changes
        will be notified via the app.
      </Text>

      <Text style={styles.subHeading}>8. Contact Us</Text>
      <Text style={styles.section}>
        If you have questions or concerns about this Privacy Policy, please reach
        out through the in-app Help section.
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

export default PrivacyPolicyScreen;
