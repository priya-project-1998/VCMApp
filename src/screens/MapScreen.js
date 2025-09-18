import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// Use Geolocation from a React Native package
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const mapRef = useRef(null);
  const [lastUserLocation, setLastUserLocation] = useState(null);
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getCurrentLocation = () => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    requestLocationPermission().then(hasPermission => {
      if (!hasPermission) {
        console.warn('Location permission denied');
        Alert.alert('Permission denied', 'Location permission was denied');
        return;
      }

      const success = pos => {
        const { latitude, longitude } = pos.coords;
        if (mapRef && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }
      };

      const fail = error => {
        console.warn('Error getting location: ' + (error && error.message));
        Alert.alert(
          'Location error',
          error && error.message ? error.message : 'Unable to get location',
        );
      };

      Geolocation.getCurrentPosition(success, fail, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      });
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        onUserLocationChange={e => {
          // keep last known location to use as fallback when native module can't be loaded
          try {
            setLastUserLocation(e.nativeEvent);
          } catch (err) {
            // ignore
          }
        }}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      />
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  locationButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapScreen;
