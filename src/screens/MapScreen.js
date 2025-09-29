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
  Modal,
  ScrollView,
  BackHandler,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Import SQLite services
import {
  createTables,
  saveCheckpoint,
  getPendingCheckpoints,
  markSynced,
  getCheckpointById, // <-- import the new function
} from "../services/dbService";

const { width, height } = Dimensions.get("window");

const MapScreen = ({ route, navigation }) => {
  const mapRef = useRef(null);
  const [lastUserLocation, setLastUserLocation] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [mapType, setMapType] = useState("standard"); // For Center Map dropdown
  const [centerDropdownVisible, setCenterDropdownVisible] = useState(false);
  const [actionDropdownVisible, setActionDropdownVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(2 * 60 * 60); // 2 hours in seconds
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRoute, setUserRoute] = useState([]); // Track user route
  const [checkpointStatus, setCheckpointStatus] = useState({}); // { checkpoint_id: { time, completed } }
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(null); // For testing button
  const [eventCompletedModal, setEventCompletedModal] = useState(false);
  const [loadingCheckpointId, setLoadingCheckpointId] = useState(null); // For loader on marker
  const [markerColors, setMarkerColors] = useState({}); // checkpoint_id: color
  const [timeStampDropdownVisible, setTimeStampDropdownVisible] = useState(false); // Dropdown for Time Stamp
  const [showCurrentLocationMarker, setShowCurrentLocationMarker] = useState(false);
  const [currentLocationMarkerCoords, setCurrentLocationMarkerCoords] = useState(null);
  const currentLocationTimeoutRef = useRef(null);

  // Get checkpoints from route.params (API response)
  const { checkpoints: paramCheckpoints, category_id,event_id, kml_path } = route.params || {};
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

  const syncCheckpointToServer = async (checkpointId) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      if (Platform.OS === 'android') ToastAndroid.show('No internet connection', ToastAndroid.SHORT);
      else Alert.alert('No internet connection');
      return false;
    }
    setLoadingCheckpointId(checkpointId);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        if (Platform.OS === 'android') ToastAndroid.show('No auth token found', ToastAndroid.SHORT);
        else Alert.alert('No auth token found');
        setLoadingCheckpointId(null);
        return false;
      }
      const res = await fetch(
        "https://e-pickup.randomsoftsolution.in/api/events/checkpoints/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: event_id,
            category_id: category_id,
            checkpoint_id: checkpointId,
          }),
        }
      );
      let data = {};
      try { data = await res.json(); } catch {}
      if ((res.status === 200 && data.status === "success") || data.status === "success") {
        setMarkerColors((prev) => ({ ...prev, [checkpointId]: '#185a9d' })); // blue
        const cpObj = checkpoints.find(c => c.checkpoint_id === checkpointId);
        const cpName = cpObj?.checkpoint_name || checkpointId;
        if (Platform.OS === 'android') ToastAndroid.show(`Checkpoint "${cpName}" synced successfully`, ToastAndroid.SHORT);
        else Alert.alert('Checkpoint Synced', `Checkpoint "${cpName}" synced successfully`);
        setLoadingCheckpointId(null);
        return true;
      } else {
        if (Platform.OS === 'android') ToastAndroid.show('Server error: ' + (data.message || 'Failed'), ToastAndroid.SHORT);
        else Alert.alert('Server error', data.message || 'Failed');
      }
    } catch (err) {
      if (Platform.OS === 'android') ToastAndroid.show('Network/API error', ToastAndroid.SHORT);
      else Alert.alert('Network/API error');
    }
    setLoadingCheckpointId(null);
    return false;
  };

  // ✅ Checkpoint reach detection (within ~10 meters)
  const checkProximityToCheckpoints = (lat, lng) => {
    checkpoints.forEach((cp) => {
      const distance = getDistanceFromLatLonInMeters(
        lat,
        lng,
        parseFloat(cp.latitude),
        parseFloat(cp.longitude)
      );
      if (distance < 10) {
        if (!checkpointStatus[cp.checkpoint_id]?.completed) {
          const reachedTime = new Date().toLocaleTimeString();
          setCheckpointStatus((prev) => ({
            ...prev,
            [cp.checkpoint_id]: { time: reachedTime, completed: true },
          }));
          saveCheckpoint({
            event_id: cp.event_id,
            category_id: cp.category_id,
            checkpoint_id: cp.checkpoint_id,
            checkpoint_name: cp.checkpoint_name,
            checkpoint_point: cp.checkpoint_point,
            latitude: cp.latitude,
            longitude: cp.longitude,
            sequence_number: cp.sequence_number,
            description: cp.description,
            time_stamp: reachedTime,
            status: 'completed'
          });
          // Call sync API as in button
          syncCheckpointToServer(cp.checkpoint_id);
        }
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

  // Handler for Time Stamp dropdown actions
  const handleTimeStampMenu = (action) => {
    setTimeStampDropdownVisible(false);
    switch (action) {
      case 'Checkpoint History':
        setModalVisible(true);
        break;
      case 'My Location':
        if (mapRef.current) {
          Geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 1000);
              setUserCoords({ latitude, longitude });
              setLastUserLocation({ latitude, longitude });
              setCurrentLocationMarkerCoords({ latitude, longitude });
              setShowCurrentLocationMarker(true);
              if (currentLocationTimeoutRef.current) {
                clearTimeout(currentLocationTimeoutRef.current);
              }
              currentLocationTimeoutRef.current = setTimeout(() => {
                setShowCurrentLocationMarker(false);
                currentLocationTimeoutRef.current = null;
              }, 15000);
            },
            (error) => {
              Alert.alert('Location error', error && error.message ? error.message : 'Unable to get location');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        }
        break;
      case 'Checkpoint Location':
        if (checkpoints.length && mapRef.current) {
          mapRef.current.animateToRegion(getBoundingRegion(checkpoints), 1000);
        }
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

  // Update speed and route on user location change
  const handleUserLocationChange = (e) => {
    try {
      const { latitude, longitude, speed } = e.nativeEvent.coordinate;
      setLastUserLocation({ latitude, longitude });
      setUserRoute((prev) => [...prev, { latitude, longitude }]); // Add to route
      checkProximityToCheckpoints(latitude, longitude);
      if (typeof speed === 'number' && !isNaN(speed)) {
        // speed in m/s, convert to km/h
        setCurrentSpeed(Math.round(speed * 3.6));
      }
    } catch (err) {
      // ignore
    }
  };

  // Handle back button with confirmation
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        "Close Map",
        "Do you want to close the map and save/sync all checkpoint data till you reached?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {},
          },
          {
            text: "Yes",
            onPress: () => {
              // Optionally trigger sync here if needed
              navigation.goBack();
            },
          },
        ]
      );
      return true; // Prevent default back
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  // Check if all checkpoints are completed
  useEffect(() => {
    if (
      checkpoints.length > 0 &&
      checkpoints.every(cp => checkpointStatus[cp.checkpoint_id]?.completed)
    ) {
      setEventCompletedModal(true);
    }
  }, [checkpointStatus, checkpoints]);

  useEffect(() => {
    return () => {
      if (currentLocationTimeoutRef.current) {
        clearTimeout(currentLocationTimeoutRef.current);
      }
    };
  }, []);

  // --- MOVE EVENT SIMULATION STATE ---
  const [markerPosition, setMarkerPosition] = useState(null); // Simulation marker
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef(null);

  // --- MOVE EVENT SIMULATION FUNCTION ---
  const startUserMovementSimulation = () => {
    if (!checkpoints.length) {
      Alert.alert("No Checkpoints", "There are no checkpoints to simulate.");
      return;
    }
    const startPoint = {
      latitude: parseFloat(checkpoints[0].latitude),
      longitude: parseFloat(checkpoints[0].longitude),
    };
    setMarkerPosition(startPoint);
    setUserRoute([startPoint]);
    setIsSimulating(true);
    let current = startPoint;
    let steps = 0;
    simulationIntervalRef.current = setInterval(() => {
      // Move towards a random checkpoint (other than current)
      const availableCheckpoints = checkpoints.filter(cp =>
        parseFloat(cp.latitude) !== current.latitude || parseFloat(cp.longitude) !== current.longitude
      );
      if (availableCheckpoints.length === 0) {
        clearInterval(simulationIntervalRef.current);
        setIsSimulating(false);
        return;
      }
      // Pick a random checkpoint as target
      const targetCp = availableCheckpoints[Math.floor(Math.random() * availableCheckpoints.length)];
      const target = {
        latitude: parseFloat(targetCp.latitude),
        longitude: parseFloat(targetCp.longitude),
      };
      // Move a small step towards the target
      const stepLat = (target.latitude - current.latitude) * 0.1;
      const stepLng = (target.longitude - current.longitude) * 0.1;
      const newPoint = {
        latitude: current.latitude + stepLat,
        longitude: current.longitude + stepLng,
      };
      setMarkerPosition(newPoint);
      setUserRoute(prev => [...prev, newPoint]);
      current = newPoint;
      steps++;
      // Check if reached any checkpoint (within 10m)
      for (let cp of checkpoints) {
        const dist = getDistanceFromLatLonInMeters(
          current.latitude,
          current.longitude,
          parseFloat(cp.latitude),
          parseFloat(cp.longitude)
        );
        if (dist < 100) { // changed from 10 to 100 meters
          // Call the same API as 'Mark as Completed (Test)' for this checkpoint
          (async () => {
            setLoadingCheckpointId(cp.checkpoint_id);
            try {
              const token = await AsyncStorage.getItem('authToken');
              if (!token) {
                if (Platform.OS === 'android') ToastAndroid.show('No auth token found', ToastAndroid.SHORT);
                else Alert.alert('No auth token found');
                setLoadingCheckpointId(null);
                return;
              }
              const res = await fetch(
                "https://e-pickup.randomsoftsolution.in/api/events/checkpoints/update",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    event_id: event_id,
                    category_id: category_id,
                    checkpoint_id: cp.checkpoint_id,
                  }),
                }
              );
              let data = {};
              try { data = await res.json(); } catch {}
              if ((res.status === 200 && data.status === "success") || data.status === "success") {
                setCheckpointStatus((prev) => ({
                  ...prev,
                  [cp.checkpoint_id]: { time: new Date().toLocaleTimeString(), completed: true },
                }));
                setMarkerColors((prev) => ({ ...prev, [cp.checkpoint_id]: '#185a9d' }));
                const cpName = cp.checkpoint_name || cp.checkpoint_id;
                if (Platform.OS === 'android') ToastAndroid.show(`Checkpoint \"${cpName}\" synced successfully`, ToastAndroid.SHORT);
                else Alert.alert('Checkpoint Synced', `Checkpoint \"${cpName}\" synced successfully`);
              } else {
                if (Platform.OS === 'android') ToastAndroid.show('Server error: ' + (data.message || 'Failed'), ToastAndroid.SHORT);
                else Alert.alert('Server error', data.message || 'Failed');
              }
            } catch (err) {
              if (Platform.OS === 'android') ToastAndroid.show('Network/API error', ToastAndroid.SHORT);
              else Alert.alert('Network/API error');
            }
            setLoadingCheckpointId(null);
          })();
          break;
        }
      }
      if (steps >= 30) { // 30 steps = 1 min (2s interval)
        clearInterval(simulationIntervalRef.current);
        setIsSimulating(false);
        Alert.alert("Simulation Stopped", "Random movement simulation completed.");
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Left Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Time Elapsed: {formatTime(elapsedSeconds)}</Text>
        <Text style={styles.infoText}>Checkpoint: {checkpoints.length}</Text>
        <Text style={styles.infoText}>Speed Limit: {currentSpeed}/60</Text>
      </View>
      {/* --- MOVE EVENT TEST BUTTON --- */}
      {!isSimulating && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 80,
            right: 20,
            backgroundColor: '#ff9800',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 25,
            elevation: 6,
            zIndex: 50,
          }}
          onPress={startUserMovementSimulation}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Start Move-Event
          </Text>
        </TouchableOpacity>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getBoundingRegion(checkpoints)}
        mapType={mapType}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onUserLocationChange={handleUserLocationChange}
      >
        {/* --- Simulated Polyline and Marker --- */}
        {userRoute && userRoute.length > 1 && (
          <Polyline
            coordinates={userRoute}
            strokeColor={isSimulating ? "blue" : "#185a9d"}
            strokeWidth={5}
            linecap={'round'}
            linejoin={'round'}
          />
        )}
        {isSimulating && markerPosition && (
          <Marker coordinate={markerPosition} title="Sim User" pinColor="blue" />
        )}
        {/* Show current location marker if requested */}
        {!isSimulating && showCurrentLocationMarker && currentLocationMarkerCoords && (
          <Marker
            coordinate={currentLocationMarkerCoords}
            title="My Current Location"
            pinColor="#2196F3"
          />
        )}
        {checkpoints.map((cp, idx) => (
          <Marker
            key={cp.checkpoint_id}
            testID={`marker-${cp.checkpoint_id}`}
            coordinate={{
              latitude: parseFloat(cp.latitude),
              longitude: parseFloat(cp.longitude),
            }}
            title={cp.checkpoint_name}
            pinColor={markerColors[cp.checkpoint_id] || (!checkpointStatus[cp.checkpoint_id]?.completed ? 'red' : '#185a9d')}
            onPress={() => setSelectedCheckpointId(cp.checkpoint_id)}
          />
        ))}
      </MapView>
      {/* TEST BUTTON: Mark selected checkpoint as completed */}
      {selectedCheckpointId && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#4caf50', padding: 14, borderRadius: 28, zIndex: 100, elevation: 8 }}
          onPress={async () => {
            // Check internet
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
              if (Platform.OS === 'android') ToastAndroid.show('No internet connection', ToastAndroid.SHORT);
              else Alert.alert('No internet connection');
              return;
            }
            setLoadingCheckpointId(selectedCheckpointId);
            try {
              // Use event_id and category_id from route.params, and selectedCheckpointId
              const token = await AsyncStorage.getItem('authToken');
              if (!token) {
                if (Platform.OS === 'android') ToastAndroid.show('No auth token found', ToastAndroid.SHORT);
                else Alert.alert('No auth token found');
                setLoadingCheckpointId(null);
                setSelectedCheckpointId(null);
                return;
              }
              // Log for debug
              console.log('Button pressed, event_id:', event_id, 'category_id:', category_id, 'checkpoint_id:', selectedCheckpointId);
              const res = await fetch(
                "https://e-pickup.randomsoftsolution.in/api/events/checkpoints/update",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    event_id: event_id,
                    category_id: category_id,
                    checkpoint_id: selectedCheckpointId,
                  }),
                }
              );
              let data = {};
              try { data = await res.json(); } catch {}
              if ((res.status === 200 && data.status === "success") || data.status === "success") {
                // Mark as completed
                const reachedTime = new Date().toLocaleTimeString();
                setCheckpointStatus((prev) => ({
                  ...prev,
                  [selectedCheckpointId]: { time: reachedTime, completed: true },
                }));
                setMarkerColors((prev) => ({ ...prev, [selectedCheckpointId]: '#185a9d' })); // blue
                const cpObj = checkpoints.find(c => c.checkpoint_id === selectedCheckpointId);
                const cpName = cpObj?.checkpoint_name || selectedCheckpointId;
                // Save checkpoint with new fields
                saveCheckpoint({
                  event_id: event_id,
                  category_id: category_id,
                  checkpoint_id: selectedCheckpointId,
                  checkpoint_name: cpObj?.checkpoint_name || '',
                  checkpoint_point: cpObj?.checkpoint_point || '',
                  latitude: cpObj?.latitude || '',
                  longitude: cpObj?.longitude || '',
                  sequence_number: cpObj?.sequence_number || '',
                  description: cpObj?.description || '',
                  time_stamp: reachedTime,
                  status: 'completed'
                });
                // Print local DB log for this checkpoint after saving
                setTimeout(() => {
                  getCheckpointById(selectedCheckpointId, (checkpointData) => {
                    console.log('Local DB checkpoint log:', checkpointData);
                    if (!checkpointData) {
                      console.log('No checkpoint found in local DB for id:', selectedCheckpointId);
                    }
                  });
                }, 300); // slight delay to ensure save
                if (Platform.OS === 'android') ToastAndroid.show(`Checkpoint "${cpName}" synced successfully`, ToastAndroid.SHORT);
                else Alert.alert('Checkpoint Synced', `Checkpoint "${cpName}" synced successfully`);
              } else {
                if (Platform.OS === 'android') ToastAndroid.show('Server error: ' + (data.message || 'Failed'), ToastAndroid.SHORT);
                else Alert.alert('Server error', data.message || 'Failed');
              }
            } catch (err) {
              console.log('API call error:', err);
              if (Platform.OS === 'android') ToastAndroid.show('Network/API error', ToastAndroid.SHORT);
              else Alert.alert('Network/API error');
            }
            setLoadingCheckpointId(null);
            setSelectedCheckpointId(null);
          }}
        >
          {loadingCheckpointId === selectedCheckpointId ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Mark as Completed (Test)</Text>
          )}
        </TouchableOpacity>
      )}
      {/* Floating Menu */}
      <View style={styles.floatingMenu}>
        {/* Time Stamp Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setTimeStampDropdownVisible(!timeStampDropdownVisible)}
          >
            <Text style={styles.menuBtnText}>Time Stamp ▾</Text>
          </TouchableOpacity>
          {timeStampDropdownVisible && (
            <View style={styles.dropdownMenu}>
              {['Checkpoint History', 'My Location', 'Checkpoint Location'].map((action) => (
                <TouchableOpacity
                  key={action}
                  style={styles.dropdownItem}
                  onPress={() => handleTimeStampMenu(action)}
                >
                  <Text style={styles.dropdownItemText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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

      {/* Checklist Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Checklist Details</Text>
            {/* Header Row */}
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalHeaderCell, styles.modalHeaderCellLeft]}>Sr.</Text>
              <Text style={[styles.modalHeaderCell, styles.modalHeaderCellCenter]}>Checkpoint</Text>
              <Text style={[styles.modalHeaderCell, styles.modalHeaderCellTimeRight]}>Time</Text>
              <Text style={[styles.modalHeaderCell, styles.modalHeaderCellRight]}>Status</Text>
            </View>
            <ScrollView style={{ maxHeight: 350, width: '100%' }}>
              {checkpoints.map((cp, idx) => {
                const statusObj = checkpointStatus[cp.checkpoint_id];
                return (
                  <View
                    key={cp.checkpoint_id || idx}
                    style={[styles.modalRow, idx % 2 === 0 ? styles.modalRowEven : styles.modalRowOdd]}
                  >
                    <Text style={[styles.modalCell, styles.modalCellLeft]}>{idx + 1}</Text>
                    <Text style={[styles.modalCell, styles.modalCellCenter]}>{cp.checkpoint_name || `Checkpoint ${idx + 1}`}</Text>
                    <Text style={[styles.modalCell, styles.modalCellRight]}>{statusObj?.time || '-'}</Text>
                    <Text style={[styles.modalCell, styles.modalCellRight]}>{statusObj?.completed ? 'Completed' : 'Not Completed'}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.totalCountText}>Total Checkpoints: {checkpoints.length}</Text>
          </View>
        </View>
      </Modal>

      {/* Event Completed Modal */}
      <Modal
        visible={eventCompletedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 32, alignItems: 'center', width: '80%' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#185a9d', marginBottom: 18, textAlign: 'center' }}>
              Event is completed!
            </Text>
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 28, textAlign: 'center' }}>
              You can go back to the event page.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#2196F3', paddingVertical: 12, paddingHorizontal: 38, borderRadius: 22 }}
              onPress={() => {
                setEventCompletedModal(false);
                navigation.goBack();
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* My Location Button - bottom right */}
      {/* <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.buttonText}>My Location</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { width: width, height: height },
  locationButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
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
    top: 10, // move to top
    right: 0, // move to right
    flexDirection: "column",
    alignItems: "flex-end",
    zIndex: 30, // ensure above other elements
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
    top: 10,
    left: 5,
    backgroundColor: 'rgba(255,255,255,0.92)', // more transparent
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
    fontSize: 12,
    fontWeight: '600',
    color: '#185a9d',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    alignItems: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 2,
    width: '100%',
  },
  modalHeaderCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#185a9d',
    textAlign: 'center',
  },
  modalHeaderCellLeft: {
    width: '15%',
    textAlign: 'left',
    paddingLeft: 8,
  },
  modalHeaderCellCenter: {
    width: '35%',
    textAlign: 'left',
    paddingLeft: 4,
  },
  modalHeaderCellTimeRight: {
    width: '20%',
    textAlign: 'center',
    paddingRight: 8,
  },
  modalHeaderCellRight: {
    width: '38%',
    textAlign: 'center',
    paddingRight: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 8,
    marginBottom: 2,
    width: '100%',
  },
  modalRowEven: {
    backgroundColor: '#f7fbff',
  },
  modalRowOdd: {
    backgroundColor: '#e9f5fe',
  },
  modalCell: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  modalCellLeft: {
    width: '15%',
    textAlign: 'left',
    paddingLeft: 8,
  },
  modalCellCenter: {
    width: '30%',
    textAlign: 'left',
    paddingLeft: 4,
  },
  modalCellTimeRight: {
    width: '30%',
    textAlign: 'center',
    paddingRight: 8,
  },
  modalCellRight: {
    width: '30%',
    textAlign: 'center',
    paddingRight: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#b3c6e0',
    width: '100%',
    marginVertical: 12,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#185a9d',
    marginBottom: 18,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalCountText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#185a9d',
    textAlign: 'center',
  },
});

export default MapScreen;
