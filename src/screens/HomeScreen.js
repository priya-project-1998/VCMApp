import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import EventService from "../services/apiService/event_service";
import NetworkUtils from "../utils/NetworkUtils";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375; // For iPhone SE and similar small devices
const responsiveWidth = width * 0.9; // 90% of screen width
const bannerHeight = height * 0.28; // Approximately 28% of screen height
const cardWidth = (width * 0.44); // Slightly less than 50% to account for margins

export default function Dashboard() {
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    fetchEvents(); // Call API on component mount
  }, []);

  // Restart autoplay when events data changes
  React.useEffect(() => {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    if (events.length > 0) {
      setActiveBanner(0); // Reset to first banner
      startAutoPlay();
    }
    return () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };
  }, [events]);

  // Function to fetch events from API
  const fetchEvents = async () => {
    // Check network status before making API call
    const isConnected = await NetworkUtils.getCurrentNetworkStatus();
    
    if (!isConnected) {
      NetworkUtils.showOfflineToast('Unable to refresh events. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await EventService.getEvents();
      
      console.log("API Response:", response);
      console.log("Response success:", response.success);
      console.log("Response data:", response.data);
      
      // Handle both success cases and when response has data regardless of success flag
      if (response.success || response.data) {
        // Handle different possible response structures
        let apiData = response.data || response.events || response.result || [];
        
        // If data is wrapped in another object, try to extract it
        if (typeof apiData === 'object' && !Array.isArray(apiData)) {
          apiData = apiData.events || apiData.data || apiData.list || [];
        }
        
        console.log("Processed API data:", apiData);
        
        // Check if we have data
        if (Array.isArray(apiData) && apiData.length > 0) {
          // Map API data and assign static images
          const eventsWithImages = apiData.map((event, index) => {
            console.log("Processing event:", event);
            return {
              ...event,
              id: event.id || event.event_id || `event_${index}`, // Ensure ID exists
              image: staticImages[index % staticImages.length] // Cycle through static images
            };
          });
          console.log("Events with images:", eventsWithImages);
          setEvents(eventsWithImages);
        } else {
          console.log("No events data found in response");
          setEvents([]);
        }
      } else {
        console.log("Failed to fetch events:", response.message);
        setEvents([]); // Show empty list if API fails
      }
    } catch (error) {
      console.log("Error fetching events:", error);
      
      // Check if error is due to network issues
      const isStillConnected = await NetworkUtils.getCurrentNetworkStatus();
      if (!isStillConnected) {
        NetworkUtils.showOfflineToast('Network error occurred while fetching events. Please check your connection.');
      } else {
        // Show generic error for other issues
        NetworkUtils.showOfflineToast('Failed to load events. Please try again.');
      }
      
      setEvents([]); // Show empty list if API fails
    } finally {
      setLoading(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    // Check network status before refreshing
    const isConnected = await NetworkUtils.getCurrentNetworkStatus();
    
    if (!isConnected) {
      NetworkUtils.showOfflineAlert(
        'No Internet Connection', 
        'Please connect to the internet to refresh events.'
      );
      return;
    }

    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  // Helper function to extract time from datetime string
  const extractTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      // Handle different datetime formats
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, try to extract time from string
        const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
          return `${displayHours}:${minutes} ${ampm}`;
        }
        return '';
      }
      // Format time as HH:MM AM/PM
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '';
    }
  };

  // Helper function to extract date from datetime string
  const extractDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      let dateStr = dateTimeString.toString().trim();
      
      // Remove time components - handle various formats
      // Format: "2025-09-15T14:30:00Z" or "2025-09-15T14:30:00.000Z"
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      // Format: "2025-09-15 14:30:00" or "2025-09-15 2:30 PM"
      else if (dateStr.includes(' ')) {
        dateStr = dateStr.split(' ')[0];
      }
      
      // Remove any remaining time indicators
      dateStr = dateStr.replace(/\d{1,2}:\d{2}.*$/, '').trim();
      
      // Convert YYYY-MM-DD to DD/MM/YYYY
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      
      // If already in DD/MM/YYYY or MM/DD/YYYY format, return as is
      if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return dateStr;
      }
      
      // Try to parse as date and format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return dateStr;
    } catch (error) {
      console.log('Error extracting date:', error);
      return '';
    }
  };

  const startAutoPlay = () => {
    const timer = setInterval(() => {
      if (bannerRef.current && events.length > 0) {
        const bannerCount = Math.min(events.length, 3); // Max 3 banners
        
        // Only start autoplay if we have more than 1 banner
        if (bannerCount <= 1) return;
        
        setActiveBanner((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerCount;
          console.log(`Banner autoplay: ${prevIndex} -> ${nextIndex} (total: ${bannerCount}, events: ${events.length})`);
          
          // Use setTimeout to ensure state is updated before scrolling
          setTimeout(() => {
            if (bannerRef.current) {
              try {
                bannerRef.current.scrollToIndex({
                  index: nextIndex,
                  animated: true,
                });
              } catch (error) {
                console.log('Banner scroll error:', error);
                // If scrollToIndex fails, try scrolling to beginning
                if (nextIndex === 0) {
                  bannerRef.current.scrollToOffset({
                    offset: 0,
                    animated: true,
                  });
                }
              }
            }
          }, 50);
          
          return nextIndex;
        });
      }
    }, 10000); // Change banner every 10 seconds
    setAutoPlayTimer(timer);
  };

  // For temporary testing, using network images
  const banners = [
    {
      id: "1",
      title: "Adventure Ride 2025",
      subtitle: "Experience the thrill of off-roading",
      image: { uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80' },
      date: "15-20 Oct 2025"
    },
    // {
    //   id: "2",
    //   title: "Trail Hunt Special",
    //   subtitle: "Conquer the wilderness",
    //   image: { uri: 'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?auto=format&fit=crop&q=80' },
    //   date: "1-5 Nov 2025"
    // },
    // {
    //   id: "3",
    //   title: "Quest Trail Jaipur",
    //   subtitle: "Desert adventure awaits",
    //   image: { uri: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80' },
    //   date: "10-15 Dec 2025"
    // },
  ];

  // Static images to cycle through for events
  const staticImages = [
    { uri: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1605987747728-53465288b135?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80' },
  ];

  const staticEvents = [
    {
      id: "1",
      event_name: "Trail Hunt",
      event_venue: "Indore",
      event_start_date: "2025-09-15",
      event_end_date: "2025-09-18",
      event_organised_by: "Mahindra",
      image: { uri: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80' },
    },
    {
      id: "2",
      event_name: "Quest Trail",
      event_venue: "Jaipur",
      event_start_date: "2025-09-15",
      event_end_date: "2025-09-18",
      event_organised_by: "Mahindra",
      image: { uri: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80' },
    },
    {
      id: "3",
      event_name: "Offroad Mania",
      event_venue: "Goa",
      event_start_date: "2025-10-01",
      event_end_date: "2025-10-05",
      event_organised_by: "Mahindra",
      image: { uri: 'https://images.unsplash.com/photo-1605987747728-53465288b135?auto=format&fit=crop&q=80' },
    },
    {
      id: "4",
      event_name: "Mountain Ride",
      event_venue: "Manali",
      event_start_date: "2025-11-10",
      event_end_date: "2025-11-15",
      event_organised_by: "Mahindra",
      image: { uri: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80' },
    },
  ];

  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef(null);

  // 🔹 On scroll event to set active dot
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveBanner(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#feb47b']} // Android
            tintColor="#feb47b" // iOS
            title="Pull to refresh events..." // iOS
            titleColor="#fff" // iOS
          />
        }
        ListHeaderComponent={
          <>
            {/* 🔹 Banner Carousel */}
            <FlatList
              ref={bannerRef}
              data={events.slice(0, 3)} // Show first 3 events from API
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.id || item.event_id || `banner_${index}`}
              renderItem={({ item, index }) => (
                <View style={{ width, height: bannerHeight }}>
                  <View style={[styles.bannerContainer, { height: bannerHeight - 30 }]}>
                    <Image 
                      source={staticImages[index % staticImages.length]} 
                      style={styles.bannerImage} 
                      resizeMode="cover" 
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
                      style={styles.bannerOverlay}
                    >
                      <Text style={styles.bannerTitle}>
                        {item.event_name || item.name || item.title || item.eventName || 'Event Name'}
                      </Text>
                      <Text style={styles.bannerSubtitle}>
                        📍 {item.event_venue || item.venue || item.location || item.city || item.place || item.eventVenue || 'Venue'}
                      </Text>
                      <Text style={styles.bannerDate}>
                        🗓 {extractDate(item.event_start_date || item.start_date || item.startDate) || 'Date'}
                        {(item.event_end_date || item.end_date || item.endDate) && 
                          ` - ${extractDate(item.event_end_date || item.end_date || item.endDate)}`
                        }
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              )}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
            />

            {/* 🔹 Banner Dots */}
            <View style={styles.dotsContainer}>
              {events.slice(0, 3).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (bannerRef.current && events.length > 0) {
                      bannerRef.current.scrollToIndex({
                        index: index,
                        animated: true
                      });
                      setActiveBanner(index);
                    }
                  }}
                >
                  <View
                    style={[styles.dot, activeBanner === index && styles.activeDot]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 15,
            }}>
              <View style={{
                backgroundColor: '#feb47b',
                width: 3,
                height: 24,
                marginRight: 12,
                marginLeft: width * 0.04,
                borderRadius: 2,
              }} />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <View style={{
                position: 'absolute',
                right: width * 0.04,
                backgroundColor: 'rgba(254, 180, 123, 0.15)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(254, 180, 123, 0.3)',
              }}>
                <Text style={{
                  color: '#feb47b',
                  fontSize: isSmallDevice ? 11 : 12,
                  fontWeight: '600',
                }}>
                  {loading ? 'Loading...' : `${events.length} Events`}
                </Text>
              </View>
            </View>
          </>
        }
        data={events}
        keyExtractor={(item, index) => item.id || item.event_id || `event_${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: width * 0.02 }}
        ListEmptyComponent={
          !loading && (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 50,
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '600',
                  opacity: 0.7,
                  textAlign: 'center',
                }}>
                  {loading ? 'Loading events...' : 'No events available'}
                </Text>
                <Text style={{
                  color: '#feb47b',
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: 'center',
                  opacity: 0.8,
                }}>
                  Pull down to refresh
                </Text>
              </View>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Image source={item.image} style={styles.eventImage} resizeMode="cover" />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#feb47b',
            }}>
              <Text style={[styles.eventOrg, { 
                fontSize: 11,
                color: '#feb47b',
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: {width: 0, height: 1},
                textShadowRadius: 3,
              }]} numberOfLines={1}>
                {item.event_organised_by || item.organizer || item.organized_by || item.organisedBy || item.organiser || 'Organizer'}
              </Text>
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.9)']}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 130,
                opacity: 0.95,
              }}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>
                {item.event_name || item.name || item.title || item.eventName || 'Event Name'}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  marginBottom: 6,
                }}>
                  <Text style={[styles.eventVenue, { marginBottom: 0 }]}>
                    <Text style={{ fontSize: 14, opacity: 0.9 }}>📍</Text> {
                      item.event_venue || item.venue || item.location || item.city || item.place || item.eventVenue || 'Venue'
                    }
                  </Text>
                </View>
              </View>
              <View style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                gap: 8,
              }}>
                {/* Start Date & Time */}
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  minWidth: '70%',
                }}>
                  {/* Start Time (above) */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <Text style={{ fontSize: 11, opacity: 0.8, color: '#feb47b', fontWeight: '600' }}>
                      🕒 {extractTime(item.event_start_date || item.start_date || item.startDate) || 'Time'}
                    </Text>
                  </View>
                  {/* Start Date (below) */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.eventDate, { marginBottom: 0, fontSize: 12, fontWeight: '500' }]}>
                      📅 {extractDate(item.event_start_date || item.start_date || item.startDate) || 'Date'}
                    </Text>
                  </View>
                </View>
                
                {/* End Date & Time */}
                {(item.event_end_date || item.end_date || item.endDate) && (
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    minWidth: '70%',
                  }}>
                    {/* End Time (above) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      <Text style={{ fontSize: 11, opacity: 0.8, color: '#feb47b', fontWeight: '600' }}>
                        🕐 {extractTime(item.event_end_date || item.end_date || item.endDate) || 'Time'}
                      </Text>
                    </View>
                    {/* End Date (below) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.eventDate, { marginBottom: 0, fontSize: 12, fontWeight: '500' }]}>
                        🏁 {extractDate(item.event_end_date || item.end_date || item.endDate) || 'Date'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  bannerContainer: {
    margin: 15,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerImage: { 
    width: "100%", 
    height: "100%",
    borderRadius: 20,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    height: "100%",
    justifyContent: "flex-end",
    borderRadius: 20,
  },
  bannerTitle: { 
    fontSize: isSmallDevice ? 24 : 28, 
    color: "#fff", 
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  bannerDate: {
    fontSize: 14,
    color: "#feb47b",
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },

  dotsContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: -25,
    marginBottom: 15,
    zIndex: 1,
  },
  dot: { 
    height: 6, 
    width: 6, 
    backgroundColor: "rgba(255,255,255,0.4)", 
    marginHorizontal: 3, 
    borderRadius: 3,
  },
  activeDot: { 
    backgroundColor: "#feb47b", 
    width: 18,
  },

  sectionTitle: { 
    fontSize: isSmallDevice ? 22 : 24, 
    fontWeight: "800", 
    color: "#fff", 
    marginVertical: 20,
    marginLeft: width * 0.04,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
    letterSpacing: 0.5,
    position: 'relative',
  },

  eventCard: {
    width: cardWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: isSmallDevice ? 16 : 20,
    marginBottom: 16,
    marginHorizontal: width * 0.02,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: width * 0.32,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  eventContent: {
    padding: 12,
    paddingTop: 10,
    backgroundColor: 'rgba(15, 15, 20, 0.85)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(12px)',
  },
  eventName: { 
    fontSize: isSmallDevice ? 14 : 16, 
    fontWeight: "700", 
    color: "#feb47b",
    marginBottom: 8,
    textShadowColor: 'rgba(254, 180, 123, 0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  eventVenue: { 
    fontSize: isSmallDevice ? 11 : 13, 
    color: "#ffffff", 
    marginBottom: 6,
    fontWeight: "600",
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  eventDate: { 
    fontSize: 12, 
    color: "#f0f0f0",
    letterSpacing: 0.2,
    opacity: 0.9,
    fontWeight: "500",
  },
  eventOrg: { 
    fontSize: 12, 
    color: "#feb47b",
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
