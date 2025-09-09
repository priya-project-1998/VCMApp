import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375; // For iPhone SE and similar small devices
const responsiveWidth = width * 0.9; // 90% of screen width
const bannerHeight = height * 0.28; // Approximately 28% of screen height
const cardWidth = (width * 0.44); // Slightly less than 50% to account for margins

export default function Dashboard() {
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);

  React.useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };
  }, []);

  const startAutoPlay = () => {
    const timer = setInterval(() => {
      if (bannerRef.current) {
        const nextIndex = (activeBanner + 1) % banners.length;
        bannerRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setActiveBanner(nextIndex);
      }
    }, 3000); // Change banner every 3 seconds
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
    {
      id: "2",
      title: "Trail Hunt Special",
      subtitle: "Conquer the wilderness",
      image: { uri: 'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?auto=format&fit=crop&q=80' },
      date: "1-5 Nov 2025"
    },
    {
      id: "3",
      title: "Quest Trail Jaipur",
      subtitle: "Desert adventure awaits",
      image: { uri: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80' },
      date: "10-15 Dec 2025"
    },
  ];

  const events = [
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
        ListHeaderComponent={
          <>
            {/* 🔹 Banner Carousel */}
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ width, height: bannerHeight }}>
                  <View style={[styles.bannerContainer, { height: bannerHeight - 30 }]}>
                    <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
                      style={styles.bannerOverlay}
                    >
                      <Text style={styles.bannerTitle}>{item.title}</Text>
                      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                      <Text style={styles.bannerDate}>🗓 {item.date}</Text>
                    </LinearGradient>
                  </View>
                </View>
              )}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
            />

            {/* 🔹 Banner Dots */}
            <View style={styles.dotsContainer}>
              {banners.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    bannerRef.current.scrollToIndex({
                      index: index,
                      animated: true
                    });
                    setActiveBanner(index);
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
                  {events.length} Events
                </Text>
              </View>
            </View>
          </>
        }
        data={events}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: width * 0.02 }}
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
              }]} numberOfLines={1}>{item.event_organised_by}</Text>
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
              <Text style={styles.eventName}>{item.event_name}</Text>
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
                    <Text style={{ fontSize: 14, opacity: 0.9 }}>📍</Text> {item.event_venue}
                  </Text>
                </View>
              </View>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                gap: 8,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                }}>
                  <Text style={[styles.eventDate, { marginBottom: 0 }]}>
                    <Text style={{ fontSize: 13, opacity: 0.9 }}>📅</Text> {item.event_start_date.split('-').reverse().join('/')}
                  </Text>
                </View>
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
