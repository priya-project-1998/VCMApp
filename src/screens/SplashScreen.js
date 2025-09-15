// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const remember = await AsyncStorage.getItem("rememberMe");
        const sessionExpiry = await AsyncStorage.getItem("sessionExpiry");
        const loggedInUser = await AsyncStorage.getItem("loggedInUser");

        const now = Date.now();

        setTimeout(() => {
          if (loggedInUser && sessionExpiry && Number(sessionExpiry) > now) {
            if (remember === "true") {
              navigation.replace("Drawer"); // Go to home
            } else {
              navigation.replace("LoginScreen"); // Require login again
            }
          } else {
            navigation.replace("LoginScreen"); // Expired or no session
          }
        }, 3000); // Splash delay: 3 seconds
      } catch (err) {
        console.log("Session check error", err);
        navigation.replace("LoginScreen");
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/splash.png')} 
        style={styles.splashImage}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      <Text style={styles.text}> </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#203a43' 
  },
  splashImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 10,
  },
  text: { 
    fontSize: 18, 
    marginTop: 10, 
    color: '#fff' 
  },
});
