import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CustomDrawer(props) {
  const [user, setUser] = useState(null);

  // Load user data from storage when drawer mounts
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.setItem("rememberMe", "false");
          await AsyncStorage.removeItem("sessionExpiry");
          await AsyncStorage.removeItem("loggedInUser");
          props.navigation.replace("LoginScreen");
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={require("../assets/images/profile-placeholder.png")} // Replace with actual default image
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.profileName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "guest@example.com"}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  profileEmail: {
    fontSize: 14,
    color: "#555",
  },
  logoutBtn: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});
