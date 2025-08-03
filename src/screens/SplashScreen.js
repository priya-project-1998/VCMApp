import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
              navigation.replace("Drawer"); // Go Home
            } else {
              navigation.replace("LoginScreen"); // Require login
            }
          } else {
            navigation.replace("LoginScreen"); // Expired or no session
          }
        }, 3000); // Splash 3 sec
      } catch (err) {
        console.log("Session check error", err);
        navigation.replace("LoginScreen");
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>VCM App Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#203a43' },
  text: { fontSize: 18, marginTop: 10, color: '#fff' },
});
