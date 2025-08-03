import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function CustomDrawer(props) {
  const [user, setUser] = useState(null);

  // Fetch user data whenever the drawer comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const storedUser = await AsyncStorage.getItem("loggedInUser");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      };
      fetchUser();
    }, [])
  );

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
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ marginTop: 10, flexGrow: 1 }}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={
              user?.profilePic
                ? { uri: user.profilePic }
                : require("../assets/images/profile-placeholder.png")
            }
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>{user?.name || "Guest User"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "guest@example.com"}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <DrawerItemList {...props} />

        {/* Separator Above Logout */}
        <View style={styles.separator} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

      {/* Version Text at Bottom */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v 1.0.0</Text>
      </View>
    </View>
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
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 10,
  },
  logoutBtn: {
    padding: 15,
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
  versionContainer: {
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 20, // space from bottom
  },
  versionText: {
    fontSize: 14,
    color: "#888",
  },
});
