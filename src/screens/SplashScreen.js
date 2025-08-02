import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
useEffect(() => {
  setTimeout(() => {
    navigation.replace('Login');
  }, 2000);
}, []);


  return (
    <View style={styles.container}>
      <Text style={styles.text}>VCM App Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
