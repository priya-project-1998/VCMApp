import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setName(parsedUser.name || "");
        setUsername(parsedUser.username || "");
        setMobile(parsedUser.mobile || "");
        setEmail(parsedUser.email || "");
        setProfilePic(parsedUser.profilePic || null);
      }
    })();
  }, []);

  // Pick Image from gallery
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert("Error", "Image Picker Error: " + response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setProfilePic(response.assets[0].uri);
        }
      }
    );
  };

  // Save updated profile
  const handleUpdate = async () => {
    if (!name || !username || !mobile) {
      Alert.alert("Error", "Please fill all editable fields");
      return;
    }

    const updatedUser = {
      ...user,
      name,
      username,
      mobile,
      profilePic,
    };

    // Update both loggedInUser and users list
    await AsyncStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    const storedUsers = await AsyncStorage.getItem("users");
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    users = users.map((u) => (u.email === email ? updatedUser : u));
    await AsyncStorage.setItem("users", JSON.stringify(users));

    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture */}
        <View style={styles.imageContainer}>
          <Image
            source={profilePic ? { uri: profilePic } : require("../assets/images/profile-placeholder.png")}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Icon name="edit-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.card}>
          <Text style={styles.label}>Email (Read Only)</Text>
          <TextInput style={styles.input} value={email} editable={false} />

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            keyboardType="numeric"
            onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ""))}
            maxLength={10}
          />

          <TouchableOpacity style={{ marginTop: 20 }} onPress={handleUpdate}>
            <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
              <Text style={styles.buttonText}>Update Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#ff7e5f",
    borderRadius: 15,
    padding: 5,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 15,
    width: "100%",
  },
  label: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
