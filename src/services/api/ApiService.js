import axios from "axios";

const ENV = {
  dev: {
    BASE_URL: "http://trail-hunt.randomsoftsolution.in:8000/api",
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
  qa: {
    BASE_URL: "http://qa-api.demo.com/api", // replace with QA URL
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
  prod: {
    BASE_URL: "http://trail-hunt.randomsoftsolution.in:8000/api", // replace with PROD URL
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
};

const CURRENT_ENV = "dev"; // change to "prod" when needed
const Config = { ...ENV[CURRENT_ENV], ENV_NAME: CURRENT_ENV };

const ENDPOINTS = {
  REQUEST_OTP: "/request-otp",
  VERIFY_OTP: "/verify-otp",
  LOGIN: "/login",
  REGISTER: "/register",
};

// ✅ Response Model
export class ApiResponse {
  constructor(success, code, message, data = null) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: Config.BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": Config.CONTENT_TYPE,
        Accept: Config.ACCEPT,
      },
    });
  }

   //Request OTP API
  async requestOtp(email) {
    console.log("👉 requestOtp CALLED with", email);
    try {
      const response = await this.api.post(ENDPOINTS.REQUEST_OTP, { email });
      return new ApiResponse(true, response.status, "OTP sent successfully", response.data);
    } catch (error) {
      console.log("❌ requestOtp ERROR", error.response?.data || error.message);
      return new ApiResponse(false, error.response?.status || 500, error.response?.data?.message || "Something went wrong");
    }
  }


   //Verify OTP
  async verifyOtp(payload) {
    try {
      const response = await this.api.post(ENDPOINTS.VERIFY_OTP, payload);
      return new ApiResponse(true, response.status, "OTP verified", response.data);
    } catch (error) {
      return new ApiResponse(false, error.response?.status || 500, error.response?.data?.message || "Error verifying OTP");
    }
  }

  // Login
  async login(credentials) {
    try {
      const response = await this.api.post(ENDPOINTS.LOGIN, credentials);
      return new ApiResponse(true, response.status, "Login successful", response.data);
    } catch (error) {
      return new ApiResponse(false, error.response?.status || 500, error.response?.data?.message || "Login failed");
    }
  }

  // Register
  async register(data) {
    try {
      const response = await this.api.post(ENDPOINTS.REGISTER, data);
      return new ApiResponse(true, response.status, "Registered successfully", response.data);
    } catch (error) {
      return new ApiResponse(false, error.response?.status || 500, error.response?.data?.message || "Registration failed");
    }
  }
}

export { ENDPOINTS, Config };
export default new ApiService();
