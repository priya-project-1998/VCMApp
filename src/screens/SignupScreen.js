import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState("email"); // email → otp → details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset form every time screen is focused
  useFocusEffect(
    useCallback(() => {
      setStep("email");
      setEmail("");
      setOtp("");
      setGeneratedOtp("");
      setName("");
      setUsername("");
      setMobile("");
      setPassword("");
      setShowPassword(false);
    }, [])
  );

  // Step 1 - Gmail Validation
  const handleEmailContinue = () => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid Gmail address (example@gmail.com)");
      return;
    }
    // Generate random OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);

    // Simulate sending verification email
    Alert.alert("Verification Sent", `OTP for ${email} is: ${randomOtp} (Test Mode)`);

    setStep("otp");
  };

  // Step 2 - OTP Verification
  const handleOtpVerify = () => {
    if (otp === generatedOtp || otp === "1998") {
      Alert.alert("Verified", "Email verified successfully!");
      setStep("details");
    } else {
      Alert.alert("Error", "Invalid OTP, please try again");
    }
  };

  // Step 3 - Save User Details
  const handleSignup = async () => {
    if (!name || !username || !mobile || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (username.length < 6) {
      Alert.alert("Error", "Username must be at least 6 characters long");
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
    const storedUsers = await AsyncStorage.getItem("users");
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    if (users.find(u => u.email === email || u.mobile === mobile || u.username === username)) {
      Alert.alert("Error", "User already exists");
      return;
    }
    users.push({ name, username, mobile, email, password });
    await AsyncStorage.setItem("users", JSON.stringify(users));
    Alert.alert("Success", "Account created successfully");
    navigation.replace("LoginScreen");
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

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
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
              <Text style={styles.note}>Tip: Enter 1998 if OTP not received (Test Mode)</Text>
            </>
          )}

          {step === "details" && (
            <>
              {renderInput("mail", "Email", email, setEmail, "email-address", false, false)}
              {renderInput("user", "Full Name", name, setName, "default")}
              {renderInput("user", "Username", username, setUsername, "default")}
              {renderInput("phone", "Mobile Number", mobile, (text) => setMobile(text.replace(/[^0-9]/g, '')), "numeric", false, true, false, 10)}
              {renderInput("lock", "Password", password, setPassword, "default", !showPassword, true, true)}
              <TouchableOpacity activeOpacity={0.8} onPress={handleSignup}>
                <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  note: { color: "#bbb", fontSize: 12, textAlign: "center", marginTop: 8 },
});
