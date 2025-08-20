import ApiService from "../api/ApiService";
import ENDPOINTS from "../url_end_points/endpoints";
import { ApiResponse } from "../model/ApiResponse";

class ServerRequestCallMethods {
  constructor() {
    this.api = ApiService.getApi();
  }

  // Request OTP
  async requestOtp(email) {
    console.log("👉 requestOtp CALLED with", email);
    try {
      const response = await this.api.post(ENDPOINTS.REQUEST_OTP, { email });
      return new ApiResponse(true, response.status, "OTP sent successfully", response.data);
    } catch (error) {
      console.log("❌ requestOtp ERROR", error.response?.data || error.message);
      return new ApiResponse(
        false,
        error.response?.status || 500,
        error.response?.data?.message || "Something went wrong"
      );
    }
  }

  // Verify OTP
  async verifyOtp(payload) {
    try {
      const response = await this.api.post(ENDPOINTS.VERIFY_OTP, payload);
      return new ApiResponse(true, response.status, "OTP verified", response.data);
    } catch (error) {
      return new ApiResponse(
        false,
        error.response?.status || 500,
        error.response?.data?.message || "Error verifying OTP"
      );
    }
  }

  // Login
  async login(credentials) {
    try {
      const response = await this.api.post(ENDPOINTS.LOGIN, credentials);
      return new ApiResponse(true, response.status, "Login successful", response.data);
    } catch (error) {
      return new ApiResponse(
        false,
        error.response?.status || 500,
        error.response?.data?.message || "Login failed"
      );
    }
  }

  // Register
  async register(data) {
    try {
      const response = await this.api.post(ENDPOINTS.REGISTER, data);
      return new ApiResponse(true, response.status, "Registered successfully", response.data);
    } catch (error) {
      return new ApiResponse(
        false,
        error.response?.status || 500,
        error.response?.data?.message || "Registration failed"
      );
    }
  }
}

export default new ServerRequestCallMethods();
