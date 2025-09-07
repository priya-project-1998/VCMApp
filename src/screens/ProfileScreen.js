import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import ProfileService from "../services/apiService/profile_service";
import UserProfileUpdateRequestModel from "../model/UpdateProfileModel/UserProfileUpdateRequestModel";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch profile when screen loads
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await ProfileService.getUserProfile();
      setLoading(false);

      if (res.success && res.data) {
        const user = res.data; // UserProfileModel
        setName(user.name);
        setUsername(user.username);
        setMobile(user.contact);
        setEmail(user.email);
        setAddress(user.address);
        setCity(user.city);
        setStateVal(user.state);
        setPincode(user.pincode);
      } else {
        Alert.alert("Error", res.message || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Update Profile API
  const handleUpdateProfile = async () => {
    if (!name || !mobile || !address || !city || !stateVal || !pincode) {
      Alert.alert("Error", "Please fill all editable fields");
      return;
    }

    setLoading(true);

    const updateData = new UserProfileUpdateRequestModel({ 
      name,
      contact: mobile,
      address,
      city,
      state: stateVal,
      pincode,
    });

    const res = await ProfileService.updateUserProfile(updateData);
    setLoading(false);

    if (res.success) {
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

            <InputField icon="user-check" placeholder="Username" value={username} editable={false} />
            <InputField icon="mail" placeholder="Email" value={email} editable={false} />

            {/* Editable fields */}
            <InputField icon="user" placeholder="Full Name" value={name} onChangeText={setName} />
            <InputField
              icon="phone"
              placeholder="Mobile"
              keyboardType="numeric"
              maxLength={10}
              value={mobile}
              onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ""))}
            />
            <InputField icon="map-pin" placeholder="Address" value={address} onChangeText={setAddress} />
            <InputField icon="home" placeholder="City" value={city} onChangeText={setCity} />
            <InputField icon="map" placeholder="State" value={stateVal} onChangeText={setStateVal} />
            <InputField
              icon="hash"
              placeholder="Pincode"
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

// 🔹 Reusable Input Component
const InputField = ({ icon, editable = true, ...props }) => (
  <View
    style={[
      styles.inputWrapper,
      !editable && { backgroundColor: "rgba(255,255,255,0.08)" },
    ]}
  >
    <Icon name={icon} size={18} color={editable ? "#fff" : "#bbb"} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, !editable && { color: "#bbb" }]}
      placeholderTextColor={editable ? "rgba(255,255,255,0.6)" : "rgba(187,187,187,0.7)"}
      editable={editable}
      {...props}
    />
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
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
