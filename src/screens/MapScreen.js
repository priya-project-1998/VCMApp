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

  // ✅ API se aane wala checkpoints data (route se pass karo)
  const { checkpoints: paramCheckpoints } = route.params || {};

  const sampleCheckpoints = [
    {
      checkpoint_id: "1",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Random Soft Solution",
      checkpoint_point: "0.00000000",
      latitude: "22.68107300",
      longitude: "75.85340200",
      sequence_number: "1",
      description: "",
    },
    {
      checkpoint_id: "151",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Random Soft Solution",
      checkpoint_point: "0.00000000",
      latitude: "22.68107300",
      longitude: "75.85340200",
      sequence_number: "1",
      description: "",
    },
    {
      checkpoint_id: "2",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 2",
      checkpoint_point: "0.00000000",
      latitude: "22.68004350",
      longitude: "75.85217730",
      sequence_number: "2",
      description: "2000",
    },
    {
      checkpoint_id: "152",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 2",
      checkpoint_point: "0.00000000",
      latitude: "22.68004350",
      longitude: "75.85217730",
      sequence_number: "2",
      description: "2000",
    },
    {
      checkpoint_id: "3",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 2",
      checkpoint_point: "0.00000000",
      latitude: "22.67711630",
      longitude: "75.84901230",
      sequence_number: "3",
      description: "100",
    },
    {
      checkpoint_id: "153",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 2",
      checkpoint_point: "0.00000000",
      latitude: "22.67711630",
      longitude: "75.84901230",
      sequence_number: "3",
      description: "100",
    },
    {
      checkpoint_id: "4",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 3",
      checkpoint_point: "0.00000000",
      latitude: "22.67535720",
      longitude: "75.84499920",
      sequence_number: "4",
      description: "1200",
    },
    {
      checkpoint_id: "154",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 3",
      checkpoint_point: "0.00000000",
      latitude: "22.67535720",
      longitude: "75.84499920",
      sequence_number: "4",
      description: "1200",
    },
    {
      checkpoint_id: "5",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 4",
      checkpoint_point: "0.00000000",
      latitude: "22.67251080",
      longitude: "75.83768150",
      sequence_number: "5",
      description: "300",
    },
    {
      checkpoint_id: "155",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 4",
      checkpoint_point: "0.00000000",
      latitude: "22.67251080",
      longitude: "75.83768150",
      sequence_number: "5",
      description: "300",
    },
    {
      checkpoint_id: "6",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 4",
      checkpoint_point: "0.00000000",
      latitude: "22.67074590",
      longitude: "75.83421080",
      sequence_number: "6",
      description: "800",
    },
    {
      checkpoint_id: "156",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 4",
      checkpoint_point: "0.00000000",
      latitude: "22.67074590",
      longitude: "75.83421080",
      sequence_number: "6",
      description: "800",
    },
    {
      checkpoint_id: "7",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 5",
      checkpoint_point: "0.00000000",
      latitude: "22.66803250",
      longitude: "75.83320220",
      sequence_number: "7",
      description: "200",
    },
    {
      checkpoint_id: "157",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 5",
      checkpoint_point: "0.00000000",
      latitude: "22.66803250",
      longitude: "75.83320220",
      sequence_number: "7",
      description: "200",
    },
    {
      checkpoint_id: "8",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Check Point 6",
      checkpoint_point: "0.00000000",
      latitude: "22.66464480",
      longitude: "75.83377240",
      sequence_number: "8",
      description: "500",
    },
    {
      checkpoint_id: "158",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Check Point 6",
      checkpoint_point: "0.00000000",
      latitude: "22.66464480",
      longitude: "75.83377240",
      sequence_number: "8",
      description: "500",
    },
    {
      checkpoint_id: "9",
      event_id: "1",
      category_id: "1",
      checkpoint_name: "Finish",
      checkpoint_point: "0.00000000",
      latitude: "22.66181750",
      longitude: "75.83376160",
      sequence_number: "9",
      description: "1000",
    },
    {
      checkpoint_id: "159",
      event_id: "1",
      category_id: "0",
      checkpoint_name: "Finish",
      checkpoint_point: "0.00000000",
      latitude: "22.66181750",
      longitude: "75.83376160",
      sequence_number: "9",
      description: "1000",
    },
  ];

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
              console.log("Sync response:", data);

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

  const checkpoints = paramCheckpoints || sampleCheckpoints;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude:
            checkpoints.length > 0
              ? parseFloat(checkpoints[0].latitude)
              : 0,
          longitude:
            checkpoints.length > 0
              ? parseFloat(checkpoints[0].longitude)
              : 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
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
        {checkpoints.map((cp) => (
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
