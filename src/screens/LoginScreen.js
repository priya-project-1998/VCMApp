import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import AuthService from "../services/apiService/auth_service";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    const response = await AuthService.login(username, password, rememberMe);
    if (response.success) {
      navigation.replace("Drawer");
    } else {
      Alert.alert("Login Failed", response.message || "Invalid credentials");
    }
  };

  const renderInput = (icon, placeholder, value, setValue, keyboard, secure, showToggle) => (
    <View style={styles.inputContainer}>
      <Icon name={icon} size={20} color="#ccc" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={setValue}
        keyboardType={keyboard}
        secureTextEntry={secure && !showPassword}
      />
      {showToggle && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          {renderInput("user", "Username", username, setUsername, "default", false)}
          {renderInput("lock", "Password", password, setPassword, "default", true, true)}

          <View style={styles.rememberContainer}>
            <CheckBox value={rememberMe} onValueChange={setRememberMe} />
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
            <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.button}>
              <Text style={styles.buttonText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
            <Text style={styles.link}>Forget Password</Text>
          </TouchableOpacity>


          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>

          
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 15 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, marginVertical: 8, paddingHorizontal: 10, paddingVertical: 12 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  rememberContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  rememberText: { color: "#fff", marginLeft: 5 },
  button: { paddingVertical: 14, borderRadius: 10, marginTop: 15 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18, textAlign: "center" },
  link: { color: "#feb47b", textAlign: "center", marginTop: 15, fontSize: 16 },
});




