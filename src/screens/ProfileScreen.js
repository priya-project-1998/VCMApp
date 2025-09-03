import React, { useState } from "react";
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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import SignupService from "../services/apiService/signup_service"; // ✅ Correct service class

export default function SignupScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = signup, 2 = otp

  // 🔹 Signup API
  const handleSignup = async () => {
    if (!name || !username || !mobile || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await SignupService.register({
        name,
        username,
        mobile,
        email,
        password,
      });

      if (response.status) {
        Alert.alert("Success", response.message || "OTP sent!");
        setStep(2);
      } else {
        Alert.alert("Error", response.message || "Signup failed");
      }
    } catch (error) {
      Alert.alert("Error", "Network error, try again later");
    }
  };

  // 🔹 Verify OTP API
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      const response = await SignupService.verifyOtp({ email, otp });

      if (response.status) {
        Alert.alert("Success", response.message || "Account verified!");
        navigation.replace("LoginScreen");
      } else {
        Alert.alert("Error", response.message || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error, try again later");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{step === 1 ? "Create Account" : "Verify OTP"}</Text>

          {step === 1 ? (
            <>
              <InputField icon="user" placeholder="Full Name" value={name} onChangeText={setName} />
              <InputField
                icon="user-check"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <InputField
                icon="phone"
                placeholder="Mobile"
                keyboardType="numeric"
                maxLength={10}
                value={mobile}
                onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ""))}
              />
              <InputField
                icon="mail"
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <InputField
                icon="lock"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={{ marginTop: 20 }} onPress={handleSignup}>
                <LinearGradient colors={["#36d1dc", "#5b86e5"]} style={styles.button}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InputField
                icon="key"
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity style={{ marginTop: 20 }} onPress={handleVerifyOtp}>
                <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => navigation.replace("LoginScreen")}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// 🔹 Reusable Input Component
const InputField = ({ icon, ...props }) => (
  <View style={styles.inputWrapper}>
    <Icon name={icon} size={18} color="#fff" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholderTextColor="rgba(255,255,255,0.6)"
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
  loginText: {
    color: "#ddd",
    fontSize: 14,
    textAlign: "center",
  },
});
