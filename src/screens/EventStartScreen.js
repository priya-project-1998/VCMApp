import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Share } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

export default function EventStartScreen({ navigation, route }) {
  const event = route?.params?.event || {
    name: "Mahindra Adventure Trail Hunt : Comp# 030",
    date: "Jul, 20, 2025",
    flagOff: "11:15hrs",
    speedLimit: "60 kmph",
    duration: "3h 0mins",
    gpsAccuracy: "8 Meters",
    status: {
      approved: true,
      location: true,
      time: true,
      message: "All Good To Start."
    }
  };
  if (event.eventId) delete event.eventId;
  if (event.participantId) delete event.participantId;

  const status = event?.status || { approved: false, location: false, time: false, message: "Status Unknown" };
  const flagOff = event?.flagOff ?? "";

  // Timer logic
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const eventDateTime = new Date(event.date); // Only use event.date
    const updateTimer = () => {
      const now = new Date();
      const diff = eventDateTime - now;
      setTimeLeft(diff > 0 ? diff : 0);
      setTimerActive(diff > 0);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Decorative Circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Gradient Top Bar */}
        <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradientBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Start</Text>
        </View>

        {/* Banner/Icon */}
        <View style={styles.bannerContainer}>
          <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.bannerGradient}>
            <Text style={styles.bannerIcon}>🏁</Text>
          </LinearGradient>
          <View style={styles.bannerGlow} />
        </View>

        {/* Greeting */}
        <Text style={styles.greetingText}>Welcome, Explorer! Ready for your next adventure?</Text>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }} contentContainerStyle={styles.chipRow}>
          <View style={styles.chip}><Text style={styles.chipIcon}>📅</Text><Text style={styles.chipText}>{event.date}</Text></View>
          <View style={styles.chip}><Text style={styles.chipIcon}>📍</Text><Text style={styles.chipText}>{event.venue || "Venue TBD"}</Text></View>
        </ScrollView>

        {/* Event Info Card */}
        <View style={styles.glassCard}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.detailIcon}>⏰</Text><Text style={styles.label}>Flag Off</Text><Text style={styles.value}>{event.flagOff}</Text></View>
          <View style={styles.infoRow}><Text style={styles.detailIcon}>⏳</Text><Text style={styles.label}>Duration</Text><Text style={[styles.value, styles.danger]}>{event.duration}</Text></View>
          <View style={styles.infoRow}><Text style={styles.detailIcon}>📍</Text><Text style={styles.label}>GPS Accuracy</Text><Text style={[styles.value, styles.success]}>{event.gpsAccuracy}</Text></View>
          {/* Buttons */}
          <View style={styles.featureBtnRow}>
            <TouchableOpacity style={styles.featureBtn} onPress={() => {
              const shareMsg = `${event.name}\nDate: ${event.date}\nFlag Off: ${event.flagOff}\nSpeed Limit: ${event.speedLimit}`;
              if (typeof Share !== "undefined") {
                Share.share({ message: shareMsg });
              }
            }}>
              <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.featureBtnGradient}>
                <Text style={styles.featureBtnText}>Share Event</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureBtn} onPress={() => navigation.navigate("EventDetails", { event })}>
              <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.featureBtnGradient}>
                <Text style={styles.featureBtnText}>View Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Status */}
        <View style={styles.glassStatusCard}>
          <Text style={styles.statusTitle}>Event Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBox, status.approved && styles.statusBoxActive]}>
              <Text style={styles.statusIcon}>✔️</Text>
              <Text style={styles.statusText}>Approved</Text>
              {!status.approved && <Text style={styles.statusPending}>Pending</Text>}
            </View>
            <View style={[styles.statusBox, status.location && styles.statusBoxActive]}>
              <Text style={styles.statusIcon}>📍</Text>
              <Text style={styles.statusText}>Location</Text>
              {!status.location && <Text style={styles.statusPending}>Pending</Text>}
            </View>
            <View style={[styles.statusBox, status.time && styles.statusBoxActive]}>
              <Text style={styles.statusIcon}>⏰</Text>
              <Text style={styles.statusText}>Time</Text>
              {!status.time && <Text style={styles.statusPending}>Pending</Text>}
            </View>
          </View>

          {/* Timer */}
          {timerActive ? (
            <Text style={styles.timerText}>Event starts in: {formatTime(timeLeft)}</Text>
          ) : (
            <Text style={styles.statusMessage}>{status.message}</Text>
          )}

          {/* Start Button */}
          <TouchableOpacity
            style={[styles.startBtnIntegrated, (!timerActive || !(status.approved && status.location && status.time)) && styles.startBtnDisabled]}
            disabled={timerActive || !(status.approved && status.location && status.time)}
          >
            <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.startBtnGradientIntegrated}>
              <Text style={styles.startBtnTextIntegrated}>START</Text>
            </LinearGradient>
          </TouchableOpacity>
          {(timerActive || !(status.approved && status.location && status.time)) && (
            <Text style={styles.startHint}>Complete all status steps and wait for timer to enable Start</Text>
          )}
        </View>

        {/* Location Info */}
        <View style={styles.locationInfoRow}>
          <Text style={styles.locationInfoText}>
            By pressing Start, you are allowing us to track your <Text style={{ fontWeight: "bold", color: "#43cea2" }}>Location Information</Text> in background during race.
          </Text>
        </View>

        {/* Motivation */}
        <Text style={styles.motivationQuote}>"Success is not the destination, it's the journey."</Text>
        <Text style={styles.startInfo}>Click Only When Asked To Take Start</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100%",
    // backgroundColor: "#0f2027", // removed, now using gradientBg
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
    width: '100%',
    paddingHorizontal: 12,
    backgroundColor: '#203a43',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(67,206,162,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  headerBackBtn: {
    padding: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(67,206,162,0.12)',
  },
  headerBackIcon: {
    fontSize: 22,
    color: '#43cea2',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  gradientBar: {
    height: 5,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
  },
  bannerContainer: {
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43cea2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  bannerIcon: {
    fontSize: 40,
    color: '#203a43',
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 16,
    color: '#43cea2',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  glassCard: {
    width: width * 0.92,
    backgroundColor: 'rgba(15,15,20,0.95)',
    borderRadius: 24,
    padding: 20,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(67,206,162,0.18)',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#43cea2",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  label: {
    fontSize: 15,
    color: "#e0e0e0",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "400",
  },
  danger: {
    color: '#185a9d',
    fontWeight: 'bold',
  },
  success: {
    color: '#43cea2',
    fontWeight: 'bold',
  },
  divider: {
    height: 2,
    backgroundColor: '#43cea2',
    borderRadius: 2,
    marginVertical: 8,
    width: '100%',
    opacity: 0.7,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 6,
    color: '#43cea2',
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#185a9d',
    borderRadius: 2,
    marginVertical: 18,
    width: width * 0.7,
    alignSelf: 'center',
    opacity: 0.7,
  },
  glassStatusCard: {
    width: width * 0.92,
    backgroundColor: 'rgba(15,15,20,0.95)',
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(67,206,162,0.18)',
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#43cea2",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  statusBox: {
    width: 70,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(67,206,162,0.18)',
  },
  statusBoxActive: {
    backgroundColor: "#43cea2",
  },
  statusIcon: {
    fontSize: 18,
    marginBottom: 2,
    color: '#43cea2',
    textAlign: 'center',
  },
  statusText: {
    color: "#203a43",
    fontWeight: "700",
    fontSize: 13,
  },
  statusMessage: {
    backgroundColor: "#185a9d",
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    borderRadius: 6,
    padding: 7,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  statusPending: {
    color: '#185a9d',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8, // increased from 2 to 8 for more spacing below
    textAlign: 'center',
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    width: width * 0.92,
  },
  locationInfoText: {
    fontSize: 14,
    color: "#e0e0e0",
    marginLeft: 0,
    flex: 1,
    letterSpacing: 0.2,
  },
  startInfo: {
    fontSize: 15,
    color: "#43cea2",
    fontWeight: "500",
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  timerText: {
    color: '#43cea2',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  startBtnIntegrated: {
    marginTop: 14,
    width: '80%',
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#43cea2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  startBtnGradientIntegrated: {
    borderRadius: 14,
    width: '100%',
    paddingVertical: 13,
    alignItems: 'center',
  },
  startBtnTextIntegrated: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  startHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#185a9d',
    textAlign: 'center',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67,206,162,0.13)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 2,
    shadowColor: '#43cea2',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#43cea2',
    fontWeight: 'bold',
  },
  chipText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  motivationQuote: {
    fontSize: 20,
    color: '#43cea2',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    letterSpacing: 1,
    backgroundColor: 'rgba(67,206,162,0.10)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    textShadowColor: 'rgba(67,206,162,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featureBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 4,
  },
  featureBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#43cea2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  featureBtnGradient: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  featureBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

