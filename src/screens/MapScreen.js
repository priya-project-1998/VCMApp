import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";

// ✅ Import SQLite services
import {
  createTables,
  saveCheckpoint,
  getPendingCheckpoints,
  markSynced,
} from "../services/dbService";

const { width, height } = Dimensions.get("window");

const MapScreen = ({ route }) => {
  const mapRef = useRef(null);
  const [lastUserLocation, setLastUserLocation] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [mapType, setMapType] = useState("standard"); // For Center Map dropdown
  const [centerDropdownVisible, setCenterDropdownVisible] = useState(false);
  const [actionDropdownVisible, setActionDropdownVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(2 * 60 * 60); // 2 hours in seconds
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Get checkpoints from route.params (API response)
  const { checkpoints: paramCheckpoints, event_id, kml_path } = route.params || {};
  // Use paramCheckpoints only (no static fallback)
  const checkpoints = Array.isArray(paramCheckpoints) ? paramCheckpoints : [];

  // Debug logs for all received data
  // console.log('MapScreen event_id:', event_id);
  // console.log('MapScreen kml_path:', kml_path);
  // console.log('MapScreen checkpoints:', checkpoints);

  // ✅ Table create
  useEffect(() => {
    createTables();
  }, []);

  // ✅ Internet change listener → sync pending checkpoints
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        getPendingCheckpoints(async (pending) => {
          // Ensure pending is always an array
          if (!Array.isArray(pending)) pending = [];
          for (let item of pending) {
            try {
              const res = await fetch(
                "https://e-pickup.randomsoftsolution.in/api/events/checkpoints/update",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event_id: item.event_id,
                    category_id: item.category_id,
                    checkpoint_id: item.checkpoint_id,
                  }),
                }
              );
              let data = {};
              try {
                data = await res.json();
              } catch (jsonErr) {
                console.log("JSON parse error", jsonErr);
              }
              // console.log("Sync response:", data);

              if (data && data.status === "success") {
                markSynced(item.id);
              }
            } catch (err) {
              console.log("Sync failed", err);
            }
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Permission aur location fetch
  const getCurrentLocation = () => {
    const requestLocationPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "This app needs access to your location to show it on the map.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    requestLocationPermission().then((hasPermission) => {
      if (!hasPermission) {
        Alert.alert("Permission denied", "Location permission was denied");
        return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ latitude, longitude });

          if (mapRef && mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }

          // ✅ Check if near any checkpoint
          checkProximityToCheckpoints(latitude, longitude);
        },
        (error) => {
          Alert.alert(
            "Location error",
            error && error.message ? error.message : "Unable to get location"
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  // ✅ Checkpoint reach detection (within ~50 meters)
  const checkProximityToCheckpoints = (lat, lng) => {
    checkpoints.forEach((cp) => {
      const distance = getDistanceFromLatLonInMeters(
        lat,
        lng,
        parseFloat(cp.latitude),
        parseFloat(cp.longitude)
      );

      if (distance < 50) {
        console.log(`✅ Reached checkpoint: ${cp.checkpoint_name}`);
        saveCheckpoint({
          event_id: cp.event_id,
          category_id: cp.category_id,
          checkpoint_id: cp.checkpoint_id,
        });
      }
    });
  };

  // ✅ Utility: Distance calculator
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    const R = 6371000; // Radius of Earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  // Utility to get bounding region for all checkpoints
  const getBoundingRegion = (points) => {
    if (!points.length)
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    let minLat = parseFloat(points[0].latitude);
    let maxLat = parseFloat(points[0].latitude);
    let minLng = parseFloat(points[0].longitude);
    let maxLng = parseFloat(points[0].longitude);
    points.forEach((cp) => {
      const lat = parseFloat(cp.latitude);
      const lng = parseFloat(cp.longitude);
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
    };
  };

  const centerMapOptions = [
    { key: "standard", label: "Normal View" },
    { key: "satellite", label: "Satellite View" },
    { key: "hybrid", label: "Hybrid View" },
    { key: "terrain", label: "Terrain View", androidOnly: true },
  ];

  // Handler for Center Map type change
  const handleMapTypeChange = (type) => {
    if (type === "terrain" && Platform.OS !== "android") {
      Alert.alert("Not Supported", "Terrain view is only available on Android.");
      setCenterDropdownVisible(false);
      return;
    }
    setMapType(type);
    setCenterDropdownVisible(false);
  };

  // Handler for Action Menu actions
  const handleActionMenu = (action) => {
    setActionDropdownVisible(false);
    switch (action) {
      case "Map Layer":
        Alert.alert("Map Layer", "Map Layer option selected.");
        break;
      case "Distance Tool":
        Alert.alert("Distance Tool", "Distance Tool option selected.");
        break;
      case "Abort Event":
        Alert.alert("Abort Event", "Event aborted.");
        break;
      case "Call Organizer":
        Alert.alert("Call Organizer", "Calling organizer...");
        break;
      default:
        break;
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (elapsedSeconds <= 0) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [elapsedSeconds]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Update speed on user location change
  const handleUserLocationChange = (e) => {
    try {
      const { latitude, longitude, speed } = e.nativeEvent.coordinate;
      setLastUserLocation({ latitude, longitude });
      checkProximityToCheckpoints(latitude, longitude);
      if (typeof speed === 'number' && !isNaN(speed)) {
        // speed in m/s, convert to km/h
        setCurrentSpeed(Math.round(speed * 3.6));
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Left Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Time Elapsed: {formatTime(elapsedSeconds)}</Text>
        <Text style={styles.infoText}>Checkpoint: {checkpoints.length}</Text>
        <Text style={styles.infoText}>Speed Limit: {currentSpeed}/60</Text>
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getBoundingRegion(checkpoints)}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onUserLocationChange={handleUserLocationChange}
      >
        {checkpoints.map((cp, idx) => (
          <Marker
            key={cp.checkpoint_id}
            coordinate={{
              latitude: parseFloat(cp.latitude),
              longitude: parseFloat(cp.longitude),
            }}
            title={cp.checkpoint_name}
            description={`Seq: ${cp.sequence_number}`}
          />
        ))}
      </MapView>

      {/* Floating Menu */}
      <View style={styles.floatingMenu}>
        {/* Time Stamps Button */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => Alert.alert("Time Stamps", "Show time stamps.")}
        >
          <Text style={styles.menuBtnText}>Time Stamps</Text>
        </TouchableOpacity>

        {/* Center Map Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setCenterDropdownVisible(!centerDropdownVisible)}
          >
            <Text style={styles.menuBtnText}>Center Map ▾</Text>
          </TouchableOpacity>
          {centerDropdownVisible && (
            <View style={styles.dropdownMenu}>
              {centerMapOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.dropdownItem, opt.androidOnly && Platform.OS !== "android" && { opacity: 0.5 }]} 
                  onPress={() => !opt.androidOnly || Platform.OS === "android" ? handleMapTypeChange(opt.key) : null}
                  disabled={opt.androidOnly && Platform.OS !== "android"}
                >
                  <Text style={styles.dropdownItemText}>
                    {opt.label + (mapType === opt.key ? " ✓" : "")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Action Menu Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setActionDropdownVisible(!actionDropdownVisible)}
          >
            <Text style={styles.menuBtnText}>Action Menu ▾</Text>
          </TouchableOpacity>
          {actionDropdownVisible && (
            <View style={styles.dropdownMenu}>
              {["Map Layer", "Distance Tool", "Abort Event", "Call Organizer"].map((action) => (
                <TouchableOpacity
                  key={action}
                  style={styles.dropdownItem}
                  onPress={() => handleActionMenu(action)}
                >
                  <Text style={styles.dropdownItemText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.buttonText}>Get My Location</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { width: width, height: height },
  locationButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 6,
    zIndex: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  floatingMenu: {
    position: "absolute",
    top: 60,
    right: 0, // moved further right
    flexDirection: "column",
    alignItems: "flex-end",
    zIndex: 20,
  },
  menuBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginRight: 8, // added margin from right
  },
  menuBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  dropdownContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 2,
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#2196F3",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: 140,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#185a9d",
    fontWeight: "600",
  },
  infoBar: {
    position: 'absolute',
    top: 18,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#185a9d',
    marginBottom: 2,
  },
});

export default MapScreen;
