import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import EventService from "../services/apiService/event_service";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const cardWidth = width - 30; // Full width cards with margin

export default function MyEventsScreen({ navigation }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Static event images for fallback
  const staticEventImages = [
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605987747728-53465288b135?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80',
  ];

  // Fetch my events from API
  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      
      const response = await EventService.getMyEvents();
      
      console.log("=== MyEvents API Response Debug ===");
      console.log("Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      
      // Handle multiple response formats
      let eventsData = [];
      
      if (response.status === "success" && response.data) {
        if (Array.isArray(response.data)) {
          // Direct array: {status: "success", data: [...]}
          eventsData = response.data;
        } else if (response.data.events && Array.isArray(response.data.events)) {
          // Nested events: {status: "success", data: {events: [...]}}
          eventsData = response.data.events;
        }
      } else if (response.code === 200 && response.data) {
        if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.data.events) {
          eventsData = response.data.events;
        }
      }
      
      if (eventsData.length > 0) {
        // Process the events data and add fallback images
        const processedEvents = eventsData.map((event, index) => {
          return {
            ...event,
            image: event.event_pic 
              ? { uri: `https://e-pickup.randomsoftsolution.in/${event.event_pic}` }
              : { uri: staticEventImages[index % staticEventImages.length] }
          };
        });
        
        setMyEvents(processedEvents);
        console.log("✅ My Events loaded successfully:", processedEvents.length, "events");
      } else {
        // Show fallback events if no API data
        console.log("⚠️ No events from API, showing fallback events");
        setMyEvents([
          {
            id: "demo-1",
            event_name: "Trail Hunt Demo Event",
            event_venue: "Indore, MP",
            event_start_date: "2025-09-15",
            event_end_date: "2025-09-18",
            event_organised_by: "Mahindra Adventure",
            status: "upcoming",
            image: { uri: staticEventImages[0] },
          },
          {
            id: "demo-2",
            event_name: "Quest Trail Sample",
            event_venue: "Jaipur, RJ",
            event_start_date: "2025-09-20",
            event_end_date: "2025-09-22",
            event_organised_by: "Mahindra Adventure",
            status: "completed",
            image: { uri: staticEventImages[1] },
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching my events:", error);
      setMyEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on component mount and every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMyEvents();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMyEvents();
    setIsRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    // Normalize status to lowercase for consistent matching
    const normalizedStatus = status ? status.toString().toLowerCase().trim() : '';
    
    switch (normalizedStatus) {
      case 'upcoming':
      case 'pending':
      case 'active':
        return '#4CAF50'; // Green
      case 'completed':
      case 'finished':
      case 'done':
        return '#2196F3'; // Blue
      case 'cancelled':
      case 'canceled':
      case 'inactive':
        return '#F44336'; // Red
      case 'in-progress':
      case 'ongoing':
      case 'live':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray for unknown status
    }
  };

  const getStatusIcon = (status) => {
    // Normalize status to lowercase and handle different formats
    const normalizedStatus = status ? status.toString().toLowerCase().trim() : '';
    
    switch (normalizedStatus) {
      case 'upcoming':
      case 'pending':
      case 'active':
        return '⏰';
      case 'completed':
      case 'finished':
      case 'done':
        return '✅';
      case 'cancelled':
      case 'canceled':
      case 'inactive':
        return '❌';
      case 'in-progress':
      case 'ongoing':
      case 'live':
        return '🔄';
      default:
        return '📅';
    }
  };

  const renderEventCard = ({ item }) => {
    // Ensure crew_members is an array and limit to 4
    const crewMembers = (item.crew_members || []).slice(0, 4);
    return (
      <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Image source={item.image} style={styles.eventImage} resizeMode="cover" />
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
            <Text style={styles.statusEmoji}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.statusText}>{(item.status || 'unknown').toUpperCase()}</Text>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.eventOverlay}
          />
        </View>
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName} numberOfLines={2}>{item.event_name || 'Unknown Event'}</Text>
            <View style={styles.eventIds}>
              <Text style={styles.eventIdText}>Event ID: {item.event_id || 'N/A'}</Text>
            </View>
            <View style={styles.participantIdContainer}>
              <Text style={styles.participantIdText}>Participant ID: {item.participant_id || 'N/A'}</Text>
            </View>
            <View style={styles.categoryClassContainer}>
              <Text style={styles.categoryText}>Category: {item.category_id || 'N/A'}</Text>
            </View>
            <View style={styles.classContainer}>
              <Text style={styles.categoryText}>Class: {item.class_id || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>📍</Text>
              <Text style={styles.detailLabel}>Venue:</Text>
              <Text style={styles.detailText}>{item.event_venue || 'TBD'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>📅</Text>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailText}>
                {item.event_start_date ? formatDate(item.event_start_date) : 'TBD'}
                {item.event_end_date && item.event_start_date !== item.event_end_date && 
                  ` - ${formatDate(item.event_end_date)}`
                }
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>🏆</Text>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailText, { color: getStatusColor(item.status) }]}> {(item.status || 'unknown').toUpperCase()} </Text>
            </View>
          </View>
          {/* Crew Members Section */}
          <View style={styles.crewSection}>
            <View style={styles.crewHeader}>
              <Text style={styles.crewEmoji}>👥</Text>
              <Text style={styles.crewTitle}>
                Crew Members ({crewMembers.length})
              </Text>
            </View>
            <View style={styles.crewMembersList}>
              {crewMembers.map((crew, index) => (
                <View key={crew.id || index} style={styles.crewMemberCard}>
                  <View style={styles.crewAvatar}>
                    <Text style={styles.crewAvatarText}>
                      {crew.crew_name ? crew.crew_name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
                    </Text>
                  </View>
                  <View style={styles.crewInfo}>
                    <Text style={styles.crewName} numberOfLines={1}>{crew.crew_name || 'Unknown Member'}</Text>
                    <View style={styles.crewDetails}>
                      <Text style={styles.crewContact} numberOfLines={1}>Mobile: {crew.crew_mobile || 'No contact'}</Text>
                      {crew.crew_email && (
                        <Text style={styles.crewContact} numberOfLines={1}>Email: {crew.crew_email}</Text>
                      )}
                      <View style={styles.crewMetadata}>
                        <Text style={styles.crewMetaText}>ID: {crew.participant_id || 'N/A'}</Text>
                        {crew.created_at && (
                          <Text style={styles.crewMetaText}>
                            Joined: {new Date(crew.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
            }
          }} 
          style={styles.headerBackBtn}
        >
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>
      {/* Motivational Text */}
      {myEvents.length > 0 && (
        <Text style={styles.motivationText}>
          🌟 Keep exploring new adventures with your amazing crew!
        </Text>
      )}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Text style={styles.statIcon}>📅</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>{myEvents.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Text style={styles.statIcon}>👥</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>
              {myEvents.reduce((total, event) => total + (event.crew_members?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Crew</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>
              {myEvents.filter(event => event.status?.toLowerCase() === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </View>
      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#feb47b" />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : (
        /* Events List */
        <FlatList
          data={myEvents}
          keyExtractor={(item) => item.event_id?.toString() || item.id?.toString()}
          columnWrapperStyle={null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#feb47b']}
              tintColor={'#feb47b'}
              title="Pull to refresh..."
              titleColor={'#feb47b'}
            />
          }
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptySubtitle}>
                You haven't participated in any events yet. Join exciting events to see them here!
              </Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#203a43',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(254,180,123,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  headerBackIcon: {
    fontSize: 22,
    color: '#feb47b',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#feb47b',
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // visually center title with back button
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
    minHeight: 50,
    width: '100%',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 180, 123, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: '#feb47b',
    marginBottom: 1,
    textShadowColor: 'rgba(254, 180, 123, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#e0e0e0',
    fontWeight: '600',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(254, 180, 123, 0.3)',
    marginHorizontal: 8,
    height: 28,
  },
  motivationText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 15,
    textAlign: 'center',
  },
  eventCard: {
    width: cardWidth,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(254, 180, 123, 0.15)",
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusEmoji: {
    fontSize: 14,
  },
  eventOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 180,
  },
  eventContent: {
    padding: 20,
    backgroundColor: 'rgba(15, 15, 20, 0.95)',
    borderTopWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.2)',
  },
  eventHeader: {
    marginBottom: 15,
  },
  participantIdText: {
    fontSize: 13,
    color: "#feb47b",
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  eventName: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: 'rgba(254, 180, 123, 0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  eventIds: {
    marginBottom: 5,
  },
  participantIdContainer: {
    marginBottom: 8,
  },
  categoryClassContainer: {
    marginBottom: 5,
  },
  classContainer: {
    marginBottom: 0,
  },
  eventIdText: {
    fontSize: 13,
    color: "#feb47b",
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 12,
    color: "#e0e0e0",
    opacity: 0.8,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    alignSelf: 'flex-start',
  },
  eventDetails: {
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: "#feb47b",
    fontWeight: "700",
    minWidth: 50,
    letterSpacing: 0.2,
  },
  detailText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
    letterSpacing: 0.2,
  },
  crewSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(254, 180, 123, 0.2)',
    paddingTop: 20,
    marginTop: 5,
  },
  crewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  crewEmoji: {
    fontSize: 18,
  },
  crewTitle: {
    fontSize: 16,
    color: "#feb47b",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  crewMembersList: {
    gap: 15,
  },
  crewMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 180, 123, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.2)',
    gap: 15,
    marginHorizontal: 2,
  },
  crewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#feb47b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crewAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  crewDetails: {
    gap: 5,
  },
  crewContact: {
    fontSize: 11,
    color: "#e0e0e0",
    opacity: 0.85,
    fontWeight: "500",
    lineHeight: 16,
  },
  crewMetadata: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  crewMetaText: {
    fontSize: 10,
    color: "#feb47b",
    opacity: 0.7,
    fontWeight: "600",
    backgroundColor: 'rgba(254, 180, 123, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.2)',
  },
  moreCrewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(254, 180, 123, 0.05)',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
    borderStyle: 'dashed',
    gap: 10,
    marginHorizontal: 2,
  },
  moreCrewEmoji: {
    fontSize: 20,
    color: "#feb47b",
  },
  moreCrewText: {
    fontSize: 13,
    color: "#feb47b",
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
});
