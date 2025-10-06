import React, { useRef, useState, useEffect,useCallback } from "react";
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
  TextInput,
  Linking,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

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
  const [layerDropdownVisible, setLayerDropdownVisible] = useState(false);
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
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState(false); // Flag to center map on user
  const [abortPasswordModal, setAbortPasswordModal] = useState(false);
  const [abortPassword, setAbortPassword] = useState("");
  const [isFollowingUser, setIsFollowingUser] = useState(false); // Track if following user location
  const [watchId, setWatchId] = useState(null); // Store watch position ID
  
  // ✅ Speed Limit States
  const [speedLimit, setSpeedLimit] = useState(60); // Default speed limit
  const [isOverspeedAlertShown, setIsOverspeedAlertShown] = useState(false);
  const [overspeedCount, setOverspeedCount] = useState(0);
  const [lastOverspeedAlert, setLastOverspeedAlert] = useState(0);
  const [abortLoading, setAbortLoading] = useState(false);
  const [randomAbortCode, setRandomAbortCode] = useState("");
  const [enteredAbortCode, setEnteredAbortCode] = useState("");

  // Get checkpoints from route.params (API response)
  const { checkpoints: paramCheckpoints, category_id, event_id, kml_path, color, event_organizer_no, speed_limit } = route.params || {};
  // Use paramCheckpoints only (no static fallback)
  const checkpoints = Array.isArray(paramCheckpoints) ? paramCheckpoints : [];

  // Debug logs for all received data

  // ✅ Table create
  useEffect(() => {
    createTables();
  }, []);

  // ✅ Update speed limit when route param changes
  useEffect(() => {
    if (speed_limit && speed_limit !== speedLimit) {
      setSpeedLimit(speed_limit);
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Speed limit set to ${speed_limit} km/h from event data`, ToastAndroid.SHORT);
      }
    }
  }, [speed_limit]);

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
                // JSON parse error occurred
              }
              // Sync response received

              if (data && data.status === "success") {
                markSynced(item.id);
              }
            } catch (err) {
              // Sync failed
            }
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Simple Speed Limit Checking Function
  const checkSpeedLimit = useCallback((currentSpeedKmh) => {
    const now = Date.now();
    
    // Simple check - if speed exceeds limit, show continuous red alerts
    if (currentSpeedKmh > speedLimit) {
      setOverspeedCount(prev => prev + 1);
      
      if (!isOverspeedAlertShown || now - lastOverspeedAlert > 1500) {
        setLastOverspeedAlert(now);
        setIsOverspeedAlertShown(true);
      }
    } else {
      // Reset overspeed alert when speed is back under limit
      if (isOverspeedAlertShown) {
        setIsOverspeedAlertShown(false);
        setLastOverspeedAlert(0);
      }
    }
  }, [speedLimit, lastOverspeedAlert, isOverspeedAlertShown]);

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
            try {
              mapRef.current.animateToRegion(
                {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            } catch (error) {
              // Error animating to region
            }
          }

          // ✅ Check if near any checkpoint
          checkProximityToCheckpoints(latitude, longitude);
        },
        (error) => {
          // Alert.alert(
          //   "Location error",
          //   error && error.message ? error.message : "Unable to get location"
          // );
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
            over_speed: 14
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

  // ✅ Checkpoint reach detection (using dynamic accuracy radius)
  const checkProximityToCheckpoints = (lat, lng) => {
    checkpoints.forEach((cp) => {
      const distance = getDistanceFromLatLonInMeters(
        lat,
        lng,
        parseFloat(cp.latitude),
        parseFloat(cp.longitude)
      );
      // ✅ Use dynamic radius based on checkpoint accuracy, fallback to 10 meters
      const checkpointRadius = (cp.accuracy && !isNaN(parseFloat(cp.accuracy)) && parseFloat(cp.accuracy) > 0) 
        ? parseFloat(cp.accuracy) 
        : 10;
      
      if (distance < checkpointRadius) {
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
          // Only sync if not already completed
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

  const layerOptions = [
    { key: "standard", label: "Normal View" },
    { key: "satellite", label: "Satellite View" },
    { key: "hybrid", label: "Hybrid View" },
    { key: "terrain", label: "Terrain View", androidOnly: true },
  ];

  // Handler for Layers type change
  const handleMapTypeChange = (type) => {
    if (type === "terrain" && Platform.OS !== "android") {
      Alert.alert("Not Supported", "Terrain view is only available on Android.");
      setLayerDropdownVisible(false);
      return;
    }
    setMapType(type);
    setLayerDropdownVisible(false);
  };

  // ✅ Generate Random Abort Code
  const generateRandomAbortCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRandomAbortCode(code);
    return code;
  };

  // ✅ SOS Emergency Call Function
  const handleSOSCall = async () => {
    try {
      if (!event_organizer_no) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Organizer contact not available', ToastAndroid.SHORT);
        } else {
          Alert.alert('Error', 'Organizer contact not available');
        }
        return;
      }

      Alert.alert(
        "🆘 Emergency Call",
        `Do you want to call the event organizer?\n\nNumber: ${event_organizer_no}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Call Now",
            style: "default",
            onPress: () => {
              Linking.openURL(`tel:${event_organizer_no}`);
            }
          }
        ]
      );
    } catch (error) {
      console.log('SOS call error:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Error making SOS call', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to make SOS call');
      }
    }
  };

  // ✅ Enhanced Action Menu handler with Speed Limit Settings
  const handleActionMenu = (action) => {
    setActionDropdownVisible(false);
    switch (action) {
      case "Map Layer":
        setLayerDropdownVisible(true);
        break;
      case "Distance Tool":
        Alert.alert("Distance Tool", "Distance measurement tool coming soon...");
        break;
      case "Speed Limit":
        Alert.alert(
          "⚡ Speed Limit Settings",
          `Current Speed Limit: ${speedLimit} km/h (${speed_limit ? 'from event data' : 'default'})\nOverspeed Count: ${overspeedCount}`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Set to 40 km/h",
              onPress: () => {
                setSpeedLimit(40);
                setOverspeedCount(0);
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Speed limit manually set to 40 km/h', ToastAndroid.SHORT);
                }
              }
            },
            {
              text: "Set to 60 km/h",
              onPress: () => {
                setSpeedLimit(60);
                setOverspeedCount(0);
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Speed limit manually set to 60 km/h', ToastAndroid.SHORT);
                }
              }
            },
            {
              text: "Set to 80 km/h",
              onPress: () => {
                setSpeedLimit(80);
                setOverspeedCount(0);
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Speed limit manually set to 80 km/h', ToastAndroid.SHORT);
                }
              }
            },
            speed_limit ? {
              text: `Reset to Event Limit (${speed_limit})`,
              onPress: () => {
                setSpeedLimit(speed_limit);
                setOverspeedCount(0);
                if (Platform.OS === 'android') {
                  ToastAndroid.show(`Speed limit reset to event data: ${speed_limit} km/h`, ToastAndroid.SHORT);
                }
              }
            } : null
          ].filter(Boolean)
        );
        break;
      case "Abort Event":
        Alert.alert(
          "⚠️ Abort Event",
          "Are you sure you want to abort this event?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Yes, Abort",
              style: "destructive",
              onPress: () => {
                generateRandomAbortCode();
                setAbortPasswordModal(true);
              }
            }
          ]
        );
        break;
      case "Call Organizer":
        handleSOSCall();
        break;
      default:
        break;
    }
  };

  // ✅ Improved Abort Event Handler
  const handleAbortEventPassword = async () => {
    if (enteredAbortCode.trim() === "") {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please enter the abort code', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Please enter the abort code');
      }
      return;
    }

    if (enteredAbortCode.trim() !== randomAbortCode) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid abort code. Please try again.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Invalid abort code. Please try again.');
      }
      return;
    }

    setAbortLoading(true);

    try {
      // Save abort event locally
      await AsyncStorage.setItem(`event_${event_id}_aborted`, 'true');
      await AsyncStorage.setItem(`event_${event_id}_abort_time`, new Date().toISOString());
      
      // Clear location watching
      if (watchId) {
        Geolocation.clearWatch(watchId);
        setWatchId(null);
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show('Event aborted successfully', ToastAndroid.LONG);
      } else {
        Alert.alert('Success', 'Event aborted successfully');
      }

      // Navigate directly to Home screen (no details alert)
      navigation.navigate('Drawer', { screen: 'Dashboard' });
    } catch (error) {
      console.log('Abort error:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Error aborting event', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to abort event');
      }
    }

    setAbortLoading(false);
    setAbortPasswordModal(false);
    setEnteredAbortCode("");
  };

  // Handler for Time Stamp dropdown actions
  const handleTimeStampMenu = (action) => {
    setTimeStampDropdownVisible(false);
    switch (action) {
      case 'Checkpoint History':
        setModalVisible(true);
        break;
      case 'My Location':
        setShouldCenterOnUser(true); // set flag to center on user
        if (mapRef.current) {
          // Show immediate feedback
          if (Platform.OS === 'android') {
            ToastAndroid.show('Getting your location...', ToastAndroid.SHORT);
          }
          
          Geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                mapRef.current.animateToRegion({
                  latitude,
                  longitude,
                  latitudeDelta: 0.0008, // ✅ Maximum zoom level everywhere
                  longitudeDelta: 0.0008, // ✅ Maximum zoom level everywhere
                }, 1000); // ✅ Consistent animation timing
              } catch (error) {
                // Error animating to region in handleTimeStampMenu
              }
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
              
              // Success feedback
              if (Platform.OS === 'android') {
                ToastAndroid.show('Location found!', ToastAndroid.SHORT);
              }
            },
            (error) => {
              let msg = 'Location error';
              if (error && error.message) msg += ': ' + error.message;
              if (error && error.code) msg += ` (code: ${error.code})`;
              if (Platform.OS === 'android') {
                ToastAndroid.show(msg, ToastAndroid.SHORT);
              } else {
                Alert.alert('Location Error', msg);
              }
            },
            { 
              enableHighAccuracy: false, // Faster response
              timeout: 10000, // Reduced timeout
              maximumAge: 60000 // Allow cached location
            }
          );
        }
        break;
      case 'Checkpoint Location':
        if (checkpoints.length && mapRef.current) {
          try {
            mapRef.current.animateToRegion(getBoundingRegion(checkpoints), 1000);
          } catch (error) {
            // Error animating to checkpoint location
          }
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
        const speedKmh = Math.round(speed * 3.6);
        setCurrentSpeed(speedKmh);
        
        // ✅ Check speed limit
        checkSpeedLimit(speedKmh);
      }
      // Center map if flag is set
      if (shouldCenterOnUser && mapRef.current) {
        try {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } catch (error) {
          // Error animating to region in handleUserLocationChange
        }
        setShouldCenterOnUser(false);
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

  // Cleanup watch position on unmount
  useEffect(() => {
    return () => {
      if (currentLocationTimeoutRef.current) {
        clearTimeout(currentLocationTimeoutRef.current);
      }
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Function to start following user location
  const startFollowingUserLocation = () => {
    // Stop any existing watch
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }

    // Show immediate feedback
    if (Platform.OS === 'android') {
      ToastAndroid.show('Getting your location...', ToastAndroid.SHORT);
    }

    // Request location permission first
    const requestLocationPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to show it on the map.",
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
        if (Platform.OS === 'android') {
          ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
        } else {
          Alert.alert("Permission denied", "Location permission was denied");
        }
        return;
      }

      // Start watching user location
      const id = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update user coordinates
          setUserCoords({ latitude, longitude });
          setLastUserLocation({ latitude, longitude });
          
          // ✅ Check speed and speed limit
          if (typeof position.coords.speed === 'number' && !isNaN(position.coords.speed)) {
            const speedKmh = Math.round(position.coords.speed * 3.6);
            setCurrentSpeed(speedKmh);
            checkSpeedLimit(speedKmh);
          }
          
          // If first time or user wants to center, animate to location
          if (!isFollowingUser || shouldCenterOnUser) {
              try {
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.0008, // ✅ Street-level zoom detail
                    longitudeDelta: 0.0008, // ✅ Street-level zoom detail  
                  }, 1000); // ✅ Smooth animation
                }
              } catch (error) {
              // Error animating to region
            }
            
            // Success feedback only on first location
            if (!isFollowingUser) {
              if (Platform.OS === 'android') {
                //ToastAndroid.show('Location found! Following your location...', ToastAndroid.SHORT);
              }
            }
            
            setIsFollowingUser(true);
            setShouldCenterOnUser(false);
          }
          
          // Check proximity to checkpoints
          checkProximityToCheckpoints(latitude, longitude);
        },
        (error) => {
          let msg = 'Location error';
          if (error && error.message) msg += ': ' + error.message;
          if (error && error.code) msg += ` (code: ${error.code})`;
          
          if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
          } else {
            Alert.alert('Location Error', msg);
          }
          
          setIsFollowingUser(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
          distanceFilter: 10, // Only update if user moves 10 meters
        }
      );

      setWatchId(id);
    });
  };

  // Function to stop following user location
  const stopFollowingUserLocation = () => {
    if (watchId) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsFollowingUser(false);
    
    if (Platform.OS === 'android') {
      ToastAndroid.show('Stopped following location', ToastAndroid.SHORT);
    }
  };

  // --- MOVE EVENT SIMULATION STATE ---
  const [markerPosition, setMarkerPosition] = useState(null); // Simulation marker
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef(null);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0); // <-- add this line

  // Detect test mode (emulator/simulator) vs real device
  const [isTestMode, setIsTestMode] = useState(false);
  const [isTestModeChecked, setIsTestModeChecked] = useState(false);

  useEffect(() => {
    // Use DeviceInfo for reliable detection
    DeviceInfo.isEmulator().then((isEmu) => {
      setIsTestMode(isEmu);
      setIsTestModeChecked(true);
    });
  }, []);

  // Show device info on mount (only after check is complete)
  useEffect(() => {
    if (!isTestModeChecked) return;
    //let msg = `isTestMode: ${isTestMode}\n`;
    if (isTestMode) {
      msg = 'App is on Virtual Device';
    } else {
      msg = 'App is on Real Device';
    }
    if (Platform.OS === 'android') {
      //ToastAndroid.show(msg, ToastAndroid.LONG);
    } else {
      Alert.alert('Device Info', msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestModeChecked, isTestMode]);

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
    // Immediately check and sync if at a checkpoint (for first point)
    for (let cp of checkpoints) {
      const dist = getDistanceFromLatLonInMeters(
        startPoint.latitude,
        startPoint.longitude,
        parseFloat(cp.latitude),
        parseFloat(cp.longitude)
      );
      // ✅ Use dynamic radius based on checkpoint accuracy, fallback to 10 meters
      const checkpointRadius = (cp.accuracy && !isNaN(parseFloat(cp.accuracy)) && parseFloat(cp.accuracy) > 0) 
        ? parseFloat(cp.accuracy) 
        : 10;
      
      if (dist < checkpointRadius && !checkpointStatus[cp.checkpoint_id]?.completed) {
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
            // API call details removed
            
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
                  over_speed: 14
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
              const cpName = cp.checkpoint_name || cp.checkpoint_id;
              if (Platform.OS === 'android') ToastAndroid.show(`Checkpoint "${cpName}" synced successfully`, ToastAndroid.SHORT);
              else Alert.alert('Checkpoint Synced', `Checkpoint "${cpName}" synced successfully`);
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
      // Calculate simulated speed (distance/2s * 3.6)
      const distMoved = getDistanceFromLatLonInMeters(current.latitude, current.longitude, newPoint.latitude, newPoint.longitude);
      const calculatedSpeed = Math.round((distMoved / 2) * 3.6);
      setSimulatedSpeed(calculatedSpeed);
      
      // ✅ Check speed limit for simulation too
      checkSpeedLimit(calculatedSpeed);
      setMarkerPosition(newPoint);
      setUserRoute(prev => [...prev, newPoint]);
      current = newPoint;
      steps++;
      // Check if reached any checkpoint (using dynamic accuracy radius)
      for (let cp of checkpoints) {
        const dist = getDistanceFromLatLonInMeters(
          current.latitude,
          current.longitude,
          parseFloat(cp.latitude),
          parseFloat(cp.longitude)
        );
        // ✅ Use dynamic radius based on checkpoint accuracy, fallback to 10 meters
        const checkpointRadius = (cp.accuracy && !isNaN(parseFloat(cp.accuracy)) && parseFloat(cp.accuracy) > 0) 
          ? parseFloat(cp.accuracy) 
          : 10;
        
        if (dist < checkpointRadius && !checkpointStatus[cp.checkpoint_id]?.completed) {
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
                    over_speed: 14
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
                const cpName = cp.checkpoint_name || cp.checkpoint_id;
                if (Platform.OS === 'android') ToastAndroid.show(`Checkpoint "${cpName}" synced successfully`, ToastAndroid.SHORT);
                else Alert.alert('Checkpoint Synced', `Checkpoint "${cpName}" synced successfully`);
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

  // Only auto-start simulation on emulator/test mode
  useEffect(() => {
    if (isTestMode) {
      startUserMovementSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestMode]);

  return (
    <View style={styles.container}>
      {/* Top Left Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Time Elapsed: {formatTime(elapsedSeconds)}</Text>
        <Text style={styles.infoText}>Checkpoint: {Object.values(checkpointStatus).filter(s => s.completed).length}/{checkpoints.length}</Text>
        <Text style={[
          styles.infoText,
          { 
            color: (isSimulating ? simulatedSpeed : currentSpeed) > speedLimit ? '#FF5722' : '#333',
            fontWeight: (isSimulating ? simulatedSpeed : currentSpeed) > speedLimit ? 'bold' : 'normal',
          }
        ]}>
          {(isSimulating ? simulatedSpeed : currentSpeed) > speedLimit && '⚠️ '}
          Speed: {isSimulating ? simulatedSpeed : currentSpeed}/{speedLimit} km/h
          {(isSimulating ? simulatedSpeed : currentSpeed) > speedLimit && ' ⚠️'}
        </Text>
        {/* ✅ Only show this when actually overspeeding */}
        {isOverspeedAlertShown && (isSimulating ? simulatedSpeed : currentSpeed) > speedLimit && (
          <Text style={[styles.infoText, { 
            color: '#fff', 
            backgroundColor: '#FF5722', 
            fontSize: 12, 
            fontWeight: 'bold',
            padding: 4,
            borderRadius: 4,
            textAlign: 'center'
          }]}>
            🚨 REDUCE SPEED! 🚨
          </Text>
        )}
      </View>

      {/* ✅ Centered Overspeed Warning - Only show when actually overspeeding */}
      {isOverspeedAlertShown && (isSimulating ? simulatedSpeed : currentSpeed) > speedLimit && (
        <View style={{
          position: 'absolute',
          top: '40%', // ✅ Center vertically on screen
          left: 20,
          right: 20,
          backgroundColor: '#FF5722',
          padding: 20,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          elevation: 15,
          shadowColor: '#FF5722',
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            🚨 OVERSPEED! SLOW DOWN! 🚨
          </Text>
          <Text style={{
            color: '#fff',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 8
          }}>
            {isSimulating ? simulatedSpeed : currentSpeed} km/h | Limit: {speedLimit} km/h
          </Text>
        </View>
      )}

      {/* Top Right Layers Button */}
      <View style={styles.topRightContainer}>
        
        {/* Abort Event Button */}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: '#FF5722', marginBottom: 15, marginRight: 0 }]}
          onLongPress={() => {
            // Long press detected, opening abort modal
            Alert.alert(
              "⚠️ Abort Event",
              "Are you sure you want to abort this event?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    // Abort cancelled
                  }
                },
                {
                  text: "Yes, Abort",
                  style: "destructive",
                  onPress: () => {
                    generateRandomAbortCode();
                    setAbortPasswordModal(true);
                  }
                }
              ]
            );
          }}
          delayLongPress={300}
          onPress={() => {
            if (Platform.OS === 'android') {
              ToastAndroid.show('Long press to abort event', ToastAndroid.SHORT);
            } else {
              Alert.alert('Info', 'Long press to abort event');
            }
          }}
        >
        <Text style={styles.iconBtnText}>⚠️</Text>
        </TouchableOpacity>
        
        <View style={styles.topDropdownContainer}>
          <TouchableOpacity
            style={styles.topLayersBtn}
            onPress={() => setLayerDropdownVisible(!layerDropdownVisible)}
          >
            <Text style={styles.topLayersBtnText}>Layers</Text>
          </TouchableOpacity>
          {layerDropdownVisible && (
            <View style={styles.topDropdownMenu}>
              {layerOptions.map((opt) => (
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
      </View>
      {isTestMode && !isSimulating && (
        <View>
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
          
          {/* Test Abort Modal Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 140,
              right: 20,
              backgroundColor: '#FF5722',
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 20,
              elevation: 6,
              zIndex: 50,
            }}
            onPress={() => {
              // Test button pressed, opening modal
              generateRandomAbortCode();
              setAbortPasswordModal(true);
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
              Test Modal
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getBoundingRegion(checkpoints)}
        mapType={mapType}
        showsUserLocation={false} // Hide built-in user location button
        followsUserLocation={isFollowingUser} // Follow user location when tracking
        onUserLocationChange={handleUserLocationChange}
        userLocationAnnotationTitle="My Current Location" // ✅ Custom title
        userLocationCalloutEnabled={true} // ✅ Enable callout on tap
        loadingEnabled={true} // ✅ Show loading indicator
        loadingIndicatorColor="#2196F3" // ✅ Blue loading color
        loadingBackgroundColor="rgba(255,255,255,0.8)" // ✅ Semi-transparent background
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        showsCompass={true}
        showsScale={true}
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
            title="📍 My Current Location"
            description="You are here"
            pinColor="#2196F3"
          >
            <View style={{
              backgroundColor: '#2196F3',
              borderRadius: 20,
              width: 40, // ✅ Bigger marker
              height: 40, // ✅ Bigger marker
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 18, color: '#fff' }}>📍</Text>
            </View>
          </Marker>
        )}
        
        {/* ✅ Enhanced User Location Marker - Always visible when following */}
        {isFollowingUser && lastUserLocation && (
          <Marker
            coordinate={lastUserLocation}
            title="📍 My Live Location"
            description="Real-time tracking active"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={{
              backgroundColor: '#2196F3',
              borderRadius: 25,
              width: 50, // ✅ Even bigger for live tracking
              height: 50, // ✅ Even bigger for live tracking
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: '#fff',
              shadowColor: '#2196F3',
              shadowOpacity: 0.5,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 6,
              elevation: 8,
            }}>
              <Text style={{ fontSize: 22, color: '#fff' }}>📍</Text>
              {/* ✅ Pulsing ring effect */}
              <View style={{
                position: 'absolute',
                backgroundColor: 'rgba(33, 150, 243, 0.3)',
                borderRadius: 35,
                width: 70,
                height: 70,
                top: -10,
                left: -10,
              }} />
            </View>
          </Marker>
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
            pinColor={
              checkpointStatus[cp.checkpoint_id]?.completed
                ? '#4caf50' // green for completed
                : (() => {
                    //console.log(`🎨 Checkpoint ${cp.checkpoint_id} (${cp.checkpoint_name}) - Received color: "${cp.color}", Using: "${cp.color || 'green'}", Status: ${checkpointStatus[cp.checkpoint_id]?.completed ? 'completed' : 'pending'}`);
                    return (cp.color || 'red'); // use passed color or fallback to red for pending
                  })()
            }
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
              // Debug log removed
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
                    over_speed: 14
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
                    // Local DB checkpoint log removed
                    if (!checkpointData) {
                      // No checkpoint found in local DB
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
              // API call error occurred
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
      {/* Bottom Floating Menu */}
      <View style={styles.bottomFloatingMenu}>
        {/* Checkpoint History Button */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.iconBtnText}>📋</Text>
        </TouchableOpacity>

        {/* My Location Button */}
        <TouchableOpacity
          style={[
            styles.myLocationBtn, // ✅ Special style for My Location
            { backgroundColor: isFollowingUser ? '#2196F3' : '#4CAF50' } // Blue when following, green when not
          ]}
          onPress={() => {
            if (isFollowingUser) {
              stopFollowingUserLocation();
            } else {
              // ✅ Show immediate feedback
              if (Platform.OS === 'android') {
                ToastAndroid.show('Getting your location...', ToastAndroid.SHORT);
              }
              
              // ✅ Get current location and zoom immediately
              Geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  
                  // ✅ Immediate zoom to current location
                  if (mapRef.current) {
                    try {
                      mapRef.current.animateToRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.0008, // ✅ MUCH closer zoom (was 0.002)
                        longitudeDelta: 0.0008, // ✅ MUCH closer zoom (was 0.002)
                      }, 1000); // ✅ Longer animation for smoother transition
                    } catch (error) {
                      // Error zooming to My Location
                    }
                  }
                  
                  // ✅ Update coordinates
                  setUserCoords({ latitude, longitude });
                  setLastUserLocation({ latitude, longitude });
                  
                  // ✅ Success feedback
                  if (Platform.OS === 'android') {
                    ToastAndroid.show('Location found and zoomed!', ToastAndroid.SHORT);
                  }
                  
                  // ✅ Start following after finding location
                  startFollowingUserLocation();
                },
                (error) => {
                  let msg = 'Location error';
                  if (error && error.message) msg += ': ' + error.message;
                  if (Platform.OS === 'android') {
                    ToastAndroid.show(msg, ToastAndroid.SHORT);
                  } else {
                    Alert.alert('Location Error', msg);
                  }
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 5000,
                }
              );
            }
          }}
        >
          <Text style={styles.myLocationBtnText}>
            {isFollowingUser ? '📍' : '📍'}
          </Text>
        </TouchableOpacity>

        {/* Call Organizer Button (SOS) */}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: '#F44336', marginRight: 0 }]}
          onPress={handleSOSCall}
        >
          <Text style={styles.iconBtnText}>🆘</Text>
        </TouchableOpacity></View>

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

      {/* Abort Event Password Modal */}
      <Modal
        visible={abortPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAbortPasswordModal(false)}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999
        }}>
          <View style={{ 
            backgroundColor: '#fff', 
            borderRadius: 20, 
            padding: 30, 
            alignItems: 'center', 
            width: '90%', 
            maxWidth: 400,
            elevation: 50,
            shadowColor: '#000',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 20,
            zIndex: 10000
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#FF5722', 
              marginBottom: 15, 
              textAlign: 'center' 
            }}>
              ⚠️ Abort Event
            </Text>
            <Text style={{ 
              fontSize: 18, 
              color: '#333', 
              marginBottom: 15, 
              textAlign: 'center',
              lineHeight: 24
            }}>
              To confirm event abort, enter the code below:
            </Text>
            
            <View style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: '#FF5722',
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
                fontWeight: 'bold'
              }}>
                ABORT CODE:
              </Text>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#FF5722',
                letterSpacing: 8,
                fontFamily: 'monospace'
              }}>
                {randomAbortCode}
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: '#6c757d',
                  borderRadius: 8
                }}
                onPress={() => {
                  generateRandomAbortCode();
                }}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  Generate New Code
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={{
                width: '100%',
                borderWidth: 2,
                borderColor: '#FF5722',
                borderRadius: 15,
                paddingVertical: 15,
                paddingHorizontal: 20,
                fontSize: 18,
                marginBottom: 25,
                backgroundColor: '#fff',
                textAlign: 'center',
                letterSpacing: 4,
                fontFamily: 'monospace'
              }}
              placeholder="Enter the 4-digit code"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
              value={enteredAbortCode}
              onChangeText={setEnteredAbortCode}
              autoFocus={true}
            />
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              width: '100%',
              gap: 15
            }}>
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#6c757d', 
                  paddingVertical: 15, 
                  paddingHorizontal: 25, 
                  borderRadius: 25,
                  flex: 1,
                  elevation: 3
                }}
                onPress={() => {
                  setAbortPasswordModal(false);
                  setEnteredAbortCode("");
                }}
              >
                <Text style={{ 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  fontSize: 18, 
                  textAlign: 'center' 
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ 
                  backgroundColor: abortLoading ? '#999' : '#FF5722', 
                  paddingVertical: 15, 
                  paddingHorizontal: 25, 
                  borderRadius: 25,
                  flex: 1,
                  elevation: 3
                }}
                onPress={handleAbortEventPassword}
                disabled={abortLoading}
              >
                {abortLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    fontSize: 18, 
                    textAlign: 'center' 
                  }}>
                    Abort
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  topRightContainer: {
    position: "absolute",
    top: 10,
    right: 15,
    zIndex: 30,
    alignItems: "flex-end",
  },
  topDropdownContainer: {
    alignItems: "flex-end",
  },
  topLayersBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  topLayersBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  topDropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    elevation: 6,
    shadowColor: "#2196F3",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: 140,
  },
  floatingMenu: {
    position: "absolute",
    top: 10, // move to top
    right: 0, // move to right
    flexDirection: "column",
    alignItems: "flex-end",
    zIndex: 30, // ensure above other elements
  },
  bottomFloatingMenu: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  iconBtn: {
    backgroundColor: "#4CAF50",
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginRight: 12,
    zIndex: 999,       // ✅ सबसे ऊपर
    elevation: 10,     // ✅ Android

  },
  iconBtnText: {
    fontSize: 20,
    color: "#fff",
  },
  // ✅ Special style for My Location Button
  myLocationBtn: {
    backgroundColor: "#4CAF50",
    width: 65, // ✅ Bigger than normal icons (was 55)
    height: 65, // ✅ Bigger than normal icons (was 55)
    borderRadius: 32.5, // ✅ Half of width/height
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // ✅ Higher elevation for prominence
    shadowColor: "#000",
    shadowOpacity: 0.18, // ✅ More shadow
    shadowOffset: { width: 0, height: 3 }, // ✅ Bigger shadow
    shadowRadius: 6,
    marginRight: 12,
    zIndex: 999,
    borderWidth: 2, // ✅ Border for better visibility
    borderColor: "#fff", // ✅ White border
  },
  myLocationBtnText: {
    fontSize: 26, // ✅ Bigger icon (was 20)
    color: "#fff",
    textShadowColor: "#000", // ✅ Text shadow for better visibility
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomDropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  bottomMenuBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  bottomMenuBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomDropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#2196F3",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: 140,
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
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
