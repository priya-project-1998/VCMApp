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
      <View style={[styles.container, selectedResult && styles.containerFullScreen]}>
        {/* Header - Only show when not viewing details */}
        {!selectedResult && (
          <View style={styles.headerContainer}>
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.headerGradient}>
              <Text style={styles.headerTitle}>🏆 Race Results</Text>
              <Text style={styles.headerSubtitle}>Your completed events</Text>
            </LinearGradient>
          </View>
        )}

        {!selectedResult && (
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {resultsData.map((result, idx) => (
              <TouchableOpacity
                key={result.id}
                style={styles.eventCard}
                onPress={() => setSelectedResult(result)}
              >
                <LinearGradient colors={idx % 2 === 0 ? ["#667eea", "#764ba2"] : ["#f093fb", "#f5576c"]} style={styles.eventCardGradient}>
                  <View style={styles.eventIconContainer}>
                    <Text style={styles.eventIcon}>{idx === 0 ? '🏁' : idx === 1 ? '🚵‍♂️' : idx === 2 ? '🚶‍♂️' : idx === 3 ? '🏎️' : '🚴‍♂️'}</Text>
                  </View>
                  <View style={styles.eventTextContainer}>
                    <Text style={styles.eventTitle}>{result.name}</Text>
                    <Text style={styles.eventSubtitle}>📊 View detailed results</Text>
                  </View>
                  <View style={styles.eventArrowContainer}>
                    <Text style={styles.eventArrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedResult && (
          <View style={styles.detailsWrapper}>
            {/* Top Header with Back Button */}
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.backButtonTop} onPress={() => setSelectedResult(null)}>
                <Text style={styles.backIconTop}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitleDetail}>Event Details</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.detailsContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.detailCard}>
                <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>🏆 {selectedResult.name}</Text>
                </LinearGradient>

                {/* Timeline Section */}
                <View style={styles.timelineSection}>
                  <Text style={styles.sectionTitle}>📍 Race Timeline</Text>
                  <View style={styles.timelineContainer}>
                    {selectedResult.checkpoints.map((cp, idx) => (
                      <View key={cp.sr} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View style={[
                            styles.timelineDot, 
                            idx === 0 ? styles.startDot : 
                            idx === selectedResult.checkpoints.length-1 ? styles.finishDot : styles.checkpointDot
                          ]} />
                          {idx < selectedResult.checkpoints.length-1 && <View style={styles.timelineConnector} />}
                        </View>
                        <View style={styles.timelineRight}>
                          <LinearGradient 
                            colors={idx === 0 ? ["#ffecd2", "#fcb69f"] : 
                                   idx === selectedResult.checkpoints.length-1 ? ["#a8edea", "#fed6e3"] : 
                                   ["#d299c2", "#fef9d7"]} 
                            style={styles.checkpointCard}
                          >
                            <Text style={styles.checkpointName}>{cp.name}</Text>
                            <Text style={styles.checkpointTime}>🕐 {cp.time}</Text>
                          </LinearGradient>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Performance Section */}
                <View style={styles.performanceSection}>
                  <Text style={styles.sectionTitle}>📊 Performance Summary</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>⏰</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.timeTaken}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["#f093fb", "#f5576c"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={styles.statLabel}>Checkpoints</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.checkpoints}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>🎁</Text>
                        <Text style={styles.statLabel}>Bonus</Text>
                        <Text style={styles.statValue}>+{selectedResult.performance.bonus}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["#fa709a", "#fee140"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>⚡</Text>
                        <Text style={styles.statLabel}>Penalty</Text>
                        <Text style={styles.statValue}>-{selectedResult.performance.speedPenalty}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40,
  },
  containerFullScreen: {
    paddingTop: 0,
  },
  headerContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  listContainer: { 
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  eventCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventIcon: {
    fontSize: 24,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  eventArrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventArrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 6,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonTop: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  backIconTop: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleDetail: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 30,
  },
  detailsContainer: { 
    padding: 12,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  detailHeader: {
    padding: 8,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  timelineSection: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#185a9d',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  startDot: {
    backgroundColor: '#ffecd2',
    borderColor: '#fcb69f',
  },
  checkpointDot: {
    backgroundColor: '#d299c2',
    borderColor: '#fef9d7',
  },
  finishDot: {
    backgroundColor: '#a8edea',
    borderColor: '#fed6e3',
  },
  timelineConnector: {
    width: 3,
    height: 50,
    backgroundColor: '#d299c2',
    marginTop: 2,
    borderRadius: 2,
  },
  timelineRight: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 12,
  },
  checkpointCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#185a9d',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  checkpointName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  checkpointTime: {
    fontSize: 14,
    color: '#4a5568',
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#185a9d',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  fullScreenDetailsWrapper: {
    flex: 1,
    paddingTop: 44,
  },
  professionalTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  elegantBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  elegantBackIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  professionalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  navSpacer: {
    width: 56,
  },
  scrollViewStyle: {
    flex: 1,
  },
  elegantDetailsContainer: { 
    padding: 20,
  },
  premiumDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 10,
  },
  eventHeroSection: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumTimelineSection: {
    padding: 24,
  },
  premiumPerformanceSection: {
    padding: 24,
    paddingTop: 0,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  premiumIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#667eea',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  premiumSectionIcon: {
    fontSize: 22,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  premiumSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  elegantTimelineContainer: {
    paddingLeft: 8,
  },
  elegantTimelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  elegantTimelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  elegantTimelineConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
    borderRadius: 1,
  },
  timelineContent: {
    flex: 1,
    marginBottom: 8,
  },
  premiumCheckpointCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  checkpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCheckpointName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  premiumCheckpointTime: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  premiumStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  premiumStatCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  premiumStatGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  premiumStatIcon: {
    fontSize: 20,
  },
  premiumStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  premiumStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#185a9d',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  startDot: {
    backgroundColor: '#ffecd2',
    borderColor: '#fcb69f',
  },
  checkpointDot: {
    backgroundColor: '#d299c2',
    borderColor: '#fef9d7',
  },
  finishDot: {
    backgroundColor: '#a8edea',
    borderColor: '#fed6e3',
  },
  timelineConnector: {
    width: 3,
    height: 50,
    backgroundColor: '#d299c2',
    marginTop: 2,
    borderRadius: 2,
  },
  timelineRight: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 12,
  },
  checkpointCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#185a9d',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  checkpointName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  checkpointTime: {
    fontSize: 14,
    color: '#4a5568',
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#185a9d',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default ResultsScreen;
