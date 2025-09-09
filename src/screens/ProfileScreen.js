import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import ProfileService from "../services/apiService/profile_service";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch profile every time screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setLoading(true);
        const res = await ProfileService.getUserProfile();
        setLoading(false);

        if (res && res.data) {
          const user = res.data;
          setName(user.name);
          setUsername(user.username);
          setMobile(user.contact);
          setEmail(user.email);
          setAddress(user.address);
          setCity(user.city);
          setStateVal(user.state);
          setPincode(user.pincode);
        }
      };

      fetchProfile();
    }, [])
  );

  // 🔹 Update Profile API
  const handleUpdateProfile = async () => {
    if (!name || !mobile || !address || !city || !stateVal || !pincode) {
      Alert.alert("Error", "Please fill all editable fields");
      return;
    }

    setLoading(true);

    const updateData = {
      name,
      contact: mobile,
      address,
      city,
      state: stateVal,
      pincode,
    };

    const res = await ProfileService.updateUserProfile(updateData);
    console.log('profile res check',res);
    setLoading(false);

    if (res.status) {
      Alert.alert("Success", res.message || "Profile updated successfully");
    } else {
      Alert.alert("Error", res.message || "Profile update failed");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff7e5f" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Profile</Text>

            <InputField label="Username" icon="user-check" value={username} editable={false} />
            <InputField label="Email" icon="mail" value={email} editable={false} />
            <InputField label="Full Name" icon="user" value={name} onChangeText={setName} />
            <InputField
              label="Mobile"
              icon="phone"
              keyboardType="numeric"
              maxLength={10}
              value={mobile}
              onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ""))}
            />
            <InputField label="Address" icon="map-pin" value={address} onChangeText={setAddress} />
            <InputField label="City" icon="home" value={city} onChangeText={setCity} />
            <InputField label="State" icon="map" value={stateVal} onChangeText={setStateVal} />
            <InputField
              label="Pincode"
              icon="hash"
              keyboardType="numeric"
              maxLength={6}
              value={pincode}
              onChangeText={(text) => setPincode(text.replace(/[^0-9]/g, ""))}
            />

            <TouchableOpacity style={{ marginTop: 20 }} onPress={handleUpdateProfile}>
              <LinearGradient colors={["#36d1dc", "#5b86e5"]} style={styles.button}>
                <Text style={styles.buttonText}>Update Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

// 🔹 Reusable Input Component with label
const InputField = ({ label, icon, editable = true, ...props }) => (
  <View style={{ marginBottom: 15 }}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View
      style={[
        styles.inputWrapper,
        !editable && { backgroundColor: "rgba(255,255,255,0.08)" },
      ]}
    >
      <Icon
        name={icon}
        size={18}
        color={editable ? "#fff" : "#bbb"}
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, !editable && { color: "#bbb" }]}
        placeholderTextColor={editable ? "rgba(255,255,255,0.6)" : "rgba(187,187,187,0.7)"}
        editable={editable}
        {...props}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 25,
  },
  inputLabel: {
    color: "#fff",
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
