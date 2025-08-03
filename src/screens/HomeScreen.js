import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

export default function HomeScreen({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("loggedInUser");
    setIsLoggedIn(false);
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.card}>
          {user && (
            <>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.info}>📧 {user.email}</Text>
              <Text style={styles.info}>📱 {user.mobile}</Text>
            </>
          )}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.logoutGradient}>
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 26, fontWeight: "bold", color: "#feb47b", marginBottom: 10 },
  info: { fontSize: 16, color: "#ddd", marginBottom: 5 },
  logoutBtn: { width: "100%", marginTop: 20 },
  logoutGradient: { paddingVertical: 12, borderRadius: 10 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" }
});
