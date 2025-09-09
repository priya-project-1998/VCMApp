import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Dimensions } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

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
          <LinearGradient
            colors={['#0f2027', '#203a43', '#2c5364']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
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
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#feb47b',
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.2,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
    marginHorizontal: width * 0.05,
  },
  logoutBtn: {
    marginHorizontal: 12,
    marginTop: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  versionContainer: {
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },
});
