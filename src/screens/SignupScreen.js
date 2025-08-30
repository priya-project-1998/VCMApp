// SignupScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "react-native-image-picker";

import SignupService from "../services/apiService/signup_service"; // ✅ Uncommented

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStep("email");
      setEmail("");
      setOtp("");
      setName("");
      setMobile("");
      setPassword("");
      setAddress("");
      setCity("");
      setState("");
      setPincode("");
      setProfileImage(null);
      setShowPassword(false);
    }, [])
  );

  // ---------------- Handlers ----------------

  const handleEmailContinue = async () => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid Gmail address (example@gmail.com)");
      return;
    }

    try {
      setLoading(true);
      const res = await SignupService.sendOtp({ email });
      setLoading(false);

      if (res.success) {
        Alert.alert("OTP Sent", "Please check your email for the OTP.");
        setStep("otp");
      } else {
        Alert.alert("Error", res.message || "Failed to send OTP");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong while sending OTP.");
    }
  };

  const handleOtpVerify = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await SignupService.verifyOtp({ email, otp });
      setLoading(false);

      if (res.success) {
        Alert.alert("Verified", "Email verified successfully!");
        setStep("details");
      } else {
        Alert.alert("Error", res.message || "Invalid OTP.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong while verifying OTP.");
    }
  };

  const handlePickImage = () => {
    const options = { mediaType: "photo", quality: 0.7 };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Image Picker Error", response.errorMessage);
        return;
      }
      const asset = response.assets[0];
      setProfileImage({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName,
      });
    });
  };

  const handleSignup = async () => {
    if (!name || !mobile || !password || !address || !city || !state || !pincode) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);

      // ✅ Prepare form data for profile image upload
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("mobile", mobile);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);

      if (profileImage) {
        formData.append("profileImage", {
          uri: profileImage.uri,
          type: profileImage.type,
          name: profileImage.name,
        });
      }

      const res = await SignupService.register(formData);
      setLoading(false);

      if (res.success) {
        Alert.alert("Success", "Account created successfully!");
        navigation.replace("LoginScreen");
      } else {
        Alert.alert("Error", res.message || "Signup failed");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong during signup.");
    }
  };

  const renderInput = (
    icon,
    placeholder,
    value,
    setValue,
    keyboard,
    secure = false,
    editable = true,
    toggleSecure = false
  ) => (
    <View style={styles.inputContainer}>
      <Icon name={icon} size={20} color="#ccc" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={setValue}
        keyboardType={keyboard}
        secureTextEntry={secure}
        editable={editable}
      />
      {toggleSecure && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );

  // ---------------- Render ----------------

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          {step === "email" && (
            <>
              {renderInput("mail", "Enter Gmail", email, setEmail, "email-address")}
              <TouchableOpacity activeOpacity={0.8} onPress={handleEmailContinue}>
                <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
                  <Text style={styles.buttonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              {renderInput("mail", "Email", email, setEmail, "email-address", false, false)}
              {renderInput("key", "Enter OTP", otp, setOtp, "numeric")}
              <TouchableOpacity activeOpacity={0.8} onPress={handleOtpVerify}>
                <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.button}>
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === "details" && (
            <ScrollView
              style={{ maxHeight: 550 }}
              showsVerticalScrollIndicator={false}
            >
              {/* 👇 Profile Image (Default + Selected) */}
              <TouchableOpacity onPress={handlePickImage} style={styles.imageWrapper}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage.uri }
                      : require("../assets/images/profile-placeholder.png")
                  }
                  style={styles.profileImage}
                />
                {/* Pencil icon overlay */}
                <View style={styles.editIconWrapper}>
                  <Icon name="edit-2" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              {renderInput("mail", "Email", email, setEmail, "email-address", false, false)}
              {renderInput("user", "Full Name", name, setName, "default")}
              {renderInput("phone", "Mobile Number", mobile, (t) => setMobile(t.replace(/[^0-9]/g, "")), "numeric")}
              {renderInput("lock", "Password", password, setPassword, "default", !showPassword, true, true)}
              {renderInput("home", "Address", address, setAddress, "default")}
              {renderInput("map-pin", "City", city, setCity, "default")}
              {renderInput("map", "State", state, setState, "default")}
              {renderInput("hash", "Pincode", pincode, "numeric")}

              <TouchableOpacity activeOpacity={0.8} onPress={handleSignup}>
                <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#feb47b" />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  button: { paddingVertical: 14, borderRadius: 10, marginTop: 15 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" },
  link: { color: "#feb47b", textAlign: "center", marginTop: 15, fontSize: 16 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    alignSelf: "center",
    marginBottom: 15,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#feb47b",
  },
  editIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#feb47b",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },

});
