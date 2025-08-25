import AsyncStorage from "@react-native-async-storage/async-storage";
import { postRequest, HEADER_TYPES } from "../api";
import ENDPOINTS from "../endpoints";
import LoginRequestModel from "../../model/LoginModel/LoginRequestModel";
import LoginResponseModel from "../../model/LoginModel/LoginResponseModel";
import ApiResponse from "../ApiResponse";

class AuthService {
  async login(email, password, rememberMe) {
  console.log("[AuthService] login called with:", { email, password, rememberMe });

  try {
    const requestModel = new LoginRequestModel(email, password);
    console.log("[AuthService] Request Model:", requestModel.toJson());

    const response = await postRequest(
      ENDPOINTS.LOGIN,
      requestModel.toJson(),
      HEADER_TYPES.DEFAULT
    );
    console.log("[AuthService] Raw API Response:", response);

    if (response.success && response.data) {
      const loginData = LoginResponseModel.fromJson(response.data);

      if (!loginData || !loginData.access_token) {
        console.error("[AuthService] loginData invalid:", loginData);
        return new ApiResponse(false, 500, "Invalid login data from server");
      }

      // Save tokens & session
      await AsyncStorage.setItem("authToken", loginData.access_token);
      await AsyncStorage.setItem("tokenType", loginData.token_type);
      await AsyncStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      const expiry = rememberMe
        ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        : Date.now() + 60 * 1000; // 1 min for testing

      await AsyncStorage.setItem("sessionExpiry", expiry.toString());

      console.log("[AuthService] Login successful, tokens saved:", { accessToken: loginData.access_token });
      return new ApiResponse(true, 200, "Login successful", loginData);
    } else {
      // ✅ Show real API error message
      const errorMessage = response.data?.detail || response.message || "Login failed";
      console.warn("[AuthService] API returned error:", errorMessage);
      return new ApiResponse(false, response.code, errorMessage, response.data);
    }
  } catch (err) {
    console.error("[AuthService] Login exception:", err);
    return new ApiResponse(false, 500, err.message || "Login failed");
  }
}


  async logout() {
    try {
      await AsyncStorage.multiRemove(["authToken", "tokenType", "rememberMe", "sessionExpiry"]);
      console.log("[AuthService] Logout successful");
      return new ApiResponse(true, 200, "Logged out successfully");
    } catch (err) {
      console.error("[AuthService] Logout failed:", err);
      return new ApiResponse(false, 500, err.message || "Logout failed");
    }
  }

  async isSessionValid() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const expiry = await AsyncStorage.getItem("sessionExpiry");

      console.log("[AuthService] Session check:", { token, expiry });

      if (!token || !expiry) return false;
      return Date.now() < parseInt(expiry, 10);
    } catch (err) {
      console.error("[AuthService] Session check failed:", err);
      return false;
    }
  }
}

export default new AuthService();
