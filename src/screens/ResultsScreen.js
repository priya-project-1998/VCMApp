import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const ResultsScreen = () => {
  const [selectedResult, setSelectedResult] = useState(null);

  // Dummy Completed Event Results
  const resultsData = [
    {
      id: 1,
      name: "Alok Kumrawat - Event Results",
      checkpoints: [
        { sr: 1, name: "Start1 - 1000", time: "12:46:30", points: 1000, status: "completed", potentialPoints: 1000 },
        { sr: 2, name: "Point 2 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 3, name: "Point 3 - 500", time: "Missed", points: 500, status: "missed", potentialPoints: 500 },
        { sr: 4, name: "Point 4 - 1500", time: "Missed", points: 1500, status: "missed", potentialPoints: 1500 },
        { sr: 5, name: "Point 5 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 6, name: "Point 6 - 500", time: "13:56:35", points: 500, status: "completed", potentialPoints: 500 },
        { sr: 7, name: "Point 7 - 600", time: "13:58:28", points: 600, status: "completed", potentialPoints: 600 },
        { sr: 8, name: "Point 8 - 1800", time: "14:00:48", points: 1800, status: "completed", potentialPoints: 1800 },
        { sr: 9, name: "Point 9 - 1200", time: "14:01:58", points: 1200, status: "completed", potentialPoints: 1200 },
        { sr: 10, name: "Point 10 - 1200", time: "Missed", points: 1200, status: "missed", potentialPoints: 1200 },
      ],
      performance: {
        startTime: "12:46:30",
        endTime: "14:01:58",
        checkpoints: 5,
        totalCheckpoints: 10,
        bonus: 0,
        speedPenalty: 0,
        timeTaken: "00:05:23",
        totalPoints: 10100,
        checkpointPoints: 5100,
        missedCheckpoints: 5,
        completionRate: "50%",
        totalPossiblePoints: 10300
      },
    },
    {
      id: 2,
      name: "Alok Kum - Event Results",
      checkpoints: [
        { sr: 1, name: "Start1 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 2, name: "Point 2 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 3, name: "Point 3 - 500", time: "Missed", points: 500, status: "missed", potentialPoints: 500 },
        { sr: 4, name: "Point 4 - 1500", time: "Missed", points: 1500, status: "missed", potentialPoints: 1500 },
        { sr: 5, name: "Point 5 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 6, name: "Point 6 - 500", time: "Missed", points: 500, status: "missed", potentialPoints: 500 },
        { sr: 7, name: "Point 7 - 600", time: "Missed", points: 600, status: "missed", potentialPoints: 600 },
        { sr: 8, name: "Point 8 - 1800", time: "Missed", points: 1800, status: "missed", potentialPoints: 1800 },
        { sr: 9, name: "Point 9 - 1200", time: "Missed", points: 1200, status: "missed", potentialPoints: 1200 },
        { sr: 10, name: "Point 10 - 1200", time: "Missed", points: 1200, status: "missed", potentialPoints: 1200 },
      ],
      performance: {
        startTime: "N/A",
        endTime: "N/A",
        checkpoints: 0,
        totalCheckpoints: 10,
        bonus: 0,
        speedPenalty: 0,
        timeTaken: "N/A",
        totalPoints: 0,
        checkpointPoints: 0,
        missedCheckpoints: 10,
        completionRate: "0%",
        totalPossiblePoints: 10300
      },
    },
    {
      id: 3,
      name: "Alok k - Event Results",
      checkpoints: [
        { sr: 1, name: "Start1 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 2, name: "Point 2 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 3, name: "Point 3 - 500", time: "Missed", points: 500, status: "missed", potentialPoints: 500 },
        { sr: 4, name: "Point 4 - 1500", time: "Missed", points: 1500, status: "missed", potentialPoints: 1500 },
        { sr: 5, name: "Point 5 - 1000", time: "Missed", points: 1000, status: "missed", potentialPoints: 1000 },
        { sr: 6, name: "Point 6 - 500", time: "Missed", points: 500, status: "missed", potentialPoints: 500 },
        { sr: 7, name: "Point 7 - 600", time: "Missed", points: 600, status: "missed", potentialPoints: 600 },
        { sr: 8, name: "Point 8 - 1800", time: "Missed", points: 1800, status: "missed", potentialPoints: 1800 },
        { sr: 9, name: "Point 9 - 1200", time: "Missed", points: 1200, status: "missed", potentialPoints: 1200 },
        { sr: 10, name: "Point 10 - 1200", time: "Missed", points: 1200, status: "missed", potentialPoints: 1200 },
      ],
      performance: {
        startTime: "N/A",
        endTime: "N/A",
        checkpoints: 0,
        totalCheckpoints: 10,
        bonus: 0,
        speedPenalty: 0,
        timeTaken: "N/A",
        totalPoints: 0,
        checkpointPoints: 0,
        missedCheckpoints: 10,
        completionRate: "0%",
        totalPossiblePoints: 10300
      },
    },
    {
      id: 3,
      name: "Priya Sharma - Event Results",
      checkpoints: [
        { sr: 1, name: "Start1", time: "08:00:00", points: 1000, status: "completed" },
        { sr: 2, name: "Point 2", time: "08:30:10", points: 1000, status: "completed" },
        { sr: 3, name: "Point 3", time: "09:15:45", points: 500, status: "completed" },
        { sr: 4, name: "Point 4", time: "Missed", points: 1500, status: "missed" },
        { sr: 5, name: "Point 5", time: "Missed", points: 1000, status: "missed" },
        { sr: 6, name: "Point 6", time: "10:20:12", points: 500, status: "completed" },
        { sr: 7, name: "Point 7", time: "10:35:28", points: 600, status: "completed" },
        { sr: 8, name: "Point 8", time: "Missed", points: 1800, status: "missed" },
        { sr: 9, name: "Point 9", time: "Missed", points: 1200, status: "missed" },
        { sr: 10, name: "Point 10", time: "10:40:20", points: 1200, status: "completed" },
      ],
      performance: {
        startTime: "08:00:00",
        endTime: "10:40:20",
        checkpoints: 6,
        totalCheckpoints: 10,
        bonus: 0,
        speedPenalty: 0,
        timeTaken: "02:40:20",
        totalPoints: 5800,
        checkpointPoints: 5800,
        missedCheckpoints: 4,
        completionRate: "60%"
      },
    },
  ];

  return (
    <LinearGradient colors={["#1e3c72", "#2a5298", "#1e3c72"]} style={{ flex: 1 }}>
      <View style={[styles.container, selectedResult && styles.containerFullScreen]}>
        {/* Header - Only show when not viewing details */}
        {!selectedResult && (
          <View style={styles.headerContainer}>
            <LinearGradient colors={["rgba(102, 126, 234, 0.2)", "rgba(118, 75, 162, 0.2)"]} style={styles.headerGradient}>
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
                <LinearGradient 
                  colors={idx % 4 === 0 ? ["rgba(76, 201, 240, 0.3)", "rgba(67, 206, 162, 0.3)"] : 
                         idx % 4 === 1 ? ["rgba(255, 107, 107, 0.3)", "rgba(238, 90, 111, 0.3)"] : 
                         idx % 4 === 2 ? ["rgba(254, 202, 87, 0.3)", "rgba(255, 159, 243, 0.3)"] : 
                         ["rgba(84, 160, 255, 0.3)", "rgba(95, 39, 205, 0.3)"]} 
                  style={styles.eventCardGradient}
                >
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
              <View>
                <LinearGradient colors={["rgba(255, 255, 255, 0.95)", "rgba(248, 250, 252, 0.95)"]} style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>🏆 {selectedResult.name}</Text>
                </LinearGradient>

                {/* Timeline Section */}
                <View>
                  <Text style={styles.sectionTitle}>📍 Race Timeline</Text>
                  <View style={styles.timelineContainer}>
                    {selectedResult.checkpoints.map((cp, idx) => (
                      <View key={cp.sr} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View style={[
                            styles.timelineDot, 
                            idx === 0 ? styles.startDot : 
                            idx === selectedResult.checkpoints.length-1 ? styles.finishDot :
                            cp.status === "missed" ? styles.missedDot : styles.checkpointDot
                          ]} />
                          {idx < selectedResult.checkpoints.length-1 && 
                            <View style={[
                              styles.timelineConnector,
                              cp.status === "missed" ? styles.missedConnector : styles.normalConnector
                            ]} />
                          }
                        </View>
                        <View style={styles.timelineRight}>
                          <LinearGradient 
                            colors={cp.status === "missed" ? ["rgba(255, 255, 255, 0.98)", "rgba(255, 245, 245, 0.98)"] :
                                   idx === 0 ? ["rgba(255, 255, 255, 0.98)", "rgba(255, 253, 240, 0.98)"] : 
                                   idx === selectedResult.checkpoints.length-1 ? ["rgba(255, 255, 255, 0.98)", "rgba(240, 255, 250, 0.98)"] : 
                                   ["rgba(255, 255, 255, 0.98)", "rgba(248, 252, 255, 0.98)"]} 
                            style={styles.checkpointCard}
                          >
                            <Text style={[styles.enhancedCheckpointName, cp.status === "missed" && styles.missedCheckpointName]}>
                              {cp.name}
                            </Text>
                            <View style={styles.checkpointDetails}>
                              <Text style={[styles.enhancedCheckpointTime, cp.status === "missed" && styles.missedTime]}>
                                🕐 {cp.time}
                              </Text>
                              <Text style={[styles.enhancedCheckpointPoints, cp.status === "missed" && styles.missedPoints]}>
                                🏅 {cp.points} pts
                              </Text>
                            </View>
                          </LinearGradient>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Performance Section */}
                <View style={styles.enhancedPerformanceSection}>
                  <Text style={styles.sectionTitle}>📊 Performance Summary</Text>
                  
                  {/* Missed Checkpoints Details */}
                  {selectedResult.performance.missedCheckpoints > 0 && (
                    <View style={styles.missedSummaryCard}>
                      <LinearGradient colors={["rgba(255, 235, 235, 0.95)", "rgba(255, 220, 220, 0.95)"]} style={styles.missedSummaryGradient}>
                        <Text style={styles.missedSummaryTitle}>❌ Missed Checkpoints Details</Text>
                        <Text style={styles.missedSummaryText}>
                          You missed {selectedResult.performance.missedCheckpoints} out of {selectedResult.performance.totalCheckpoints} checkpoints
                        </Text>
                        <View style={styles.missedPointsContainer}>
                          {selectedResult.checkpoints
                            .filter(cp => cp.status === "missed")
                            .map((cp, idx) => (
                              <View key={idx} style={styles.missedPointItem}>
                                <Text style={styles.missedPointName}>{cp.name}</Text>
                                <Text style={styles.missedPointValue}>-{cp.potentialPoints} pts</Text>
                              </View>
                            ))
                          }
                        </View>
                        <Text style={styles.totalMissedPoints}>
                          Total Points Lost: {selectedResult.checkpoints
                            .filter(cp => cp.status === "missed")
                            .reduce((sum, cp) => sum + cp.potentialPoints, 0)} pts
                        </Text>
                      </LinearGradient>
                    </View>
                  )}

                  {/* Earned Checkpoints Details */}
                  {selectedResult.performance.checkpoints > 0 && (
                    <View style={styles.earnedSummaryCard}>
                      <LinearGradient colors={["rgba(235, 250, 255, 0.95)", "rgba(220, 245, 245, 0.95)"]} style={styles.earnedSummaryGradient}>
                        <Text style={styles.earnedSummaryTitle}>✅ Completed Checkpoints Details</Text>
                        <Text style={styles.earnedSummaryText}>
                          You completed {selectedResult.performance.checkpoints} out of {selectedResult.performance.totalCheckpoints} checkpoints
                        </Text>
                        <View style={styles.earnedPointsContainer}>
                          {selectedResult.checkpoints
                            .filter(cp => cp.status === "completed")
                            .map((cp, idx) => (
                              <View key={idx} style={styles.earnedPointItem}>
                                <Text style={styles.earnedPointName}>{cp.name}</Text>
                                <Text style={styles.earnedPointTime}>{cp.time}</Text>
                                <Text style={styles.earnedPointValue}>+{cp.points} pts</Text>
                              </View>
                            ))
                          }
                        </View>
                        <Text style={styles.totalEarnedPoints}>
                          Total Points Earned: {selectedResult.performance.checkpointPoints} pts
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(248, 250, 255, 0.95)", "rgba(240, 245, 255, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>⏰</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.timeTaken}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(240, 255, 248, 0.95)", "rgba(235, 250, 245, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.checkpoints}/{selectedResult.performance.totalCheckpoints}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(255, 245, 245, 0.95)", "rgba(255, 235, 235, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>❌</Text>
                        <Text style={styles.statLabel}>Missed</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.missedCheckpoints}</Text>
                      </LinearGradient>
                    </View>

                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(255, 240, 255, 0.95)", "rgba(250, 230, 250, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>⚡</Text>
                        <Text style={styles.statLabel}>Penalty</Text>
                        <Text style={styles.statValue}>-{selectedResult.performance.speedPenalty}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(245, 248, 255, 0.95)", "rgba(235, 240, 255, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>🏅</Text>
                        <Text style={styles.statLabel}>Checkpoint Points</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.checkpointPoints}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                      <LinearGradient colors={["rgba(255, 248, 235, 0.95)", "rgba(255, 240, 220, 0.95)"]} style={styles.statGradient}>
                        <Text style={styles.statIcon}>🏆</Text>
                        <Text style={styles.statLabel}>Total Points</Text>
                        <Text style={styles.statValue}>{selectedResult.performance.totalPoints}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  detailHeader: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timelineSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  enhancedTimelineSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    margin: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  missedDot: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ee5a6f',
  },
  timelineConnector: {
    width: 3,
    height: 50,
    backgroundColor: '#d299c2',
    marginTop: 2,
    borderRadius: 2,
  },
  normalConnector: {
    backgroundColor: '#54a0ff',
  },
  missedConnector: {
    backgroundColor: '#ff6b6b',
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
  enhancedCheckpointCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 8,
  },
  checkpointName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  enhancedCheckpointName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  checkpointDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  checkpointTime: {
    fontSize: 14,
    color: '#4a5568',
  },
  enhancedCheckpointTime: {
    fontSize: 15,
    color: '#1a202c',
    fontWeight: '600',
  },
  checkpointPoints: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  enhancedCheckpointPoints: {
    fontSize: 15,
    color: '#1a202c',
    fontWeight: 'bold',
  },
  missedCheckpointName: {
    color: '#dc2626',
  },
  missedTime: {
    color: '#dc2626',
    fontStyle: 'italic',
  },
  missedPoints: {
    color: '#dc2626',
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  enhancedPerformanceSection: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    margin: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
  missedSummaryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: '#ff7675',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  missedSummaryGradient: {
    padding: 16,
  },
  missedSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  missedSummaryText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  missedPointsContainer: {
    marginBottom: 12,
  },
  missedPointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  missedPointName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '600',
  },
  missedPointValue: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  totalMissedPoints: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  earnedSummaryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 201, 240, 0.3)',
    shadowColor: '#00b894',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  earnedSummaryGradient: {
    padding: 16,
  },
  earnedSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  earnedSummaryText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  earnedPointsContainer: {
    marginBottom: 12,
  },
  earnedPointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  earnedPointName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '600',
  },
  earnedPointTime: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '500',
  },
  earnedPointValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: 'bold',
  },
  totalEarnedPoints: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
});

export default ResultsScreen;
