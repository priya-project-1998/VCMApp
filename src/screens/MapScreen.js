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
    if (!points.length) return {
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getBoundingRegion(checkpoints)}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onUserLocationChange={(e) => {
          try {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setLastUserLocation({ latitude, longitude });
            checkProximityToCheckpoints(latitude, longitude);
          } catch (err) {
            // ignore
          }
        }}
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

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.buttonText}>Get My Location</Text>
      </TouchableOpacity>
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
});

export default MapScreen;
