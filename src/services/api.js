import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiResponse from "./ApiResponse";

const BASE_URL = "http://trail-hunt.randomsoftsolution.in:8000/api";

// 🔹 Header types
export const HEADER_TYPES = {
  DEFAULT: "default",   // Content-Type + Accept
  ACCEPT: "acceptOnly", // Accept only
  AUTH: "auth",         // Accept + Authorization
};

// 🔹 Build headers dynamically
async function buildHeaders(type, extraHeaders = {}) {
  let headers = {};

  switch (type) {
    case HEADER_TYPES.DEFAULT:
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
      break;

    case HEADER_TYPES.ACCEPT:
      headers["Accept"] = "application/json";
      break;

    case HEADER_TYPES.AUTH:
      const token = await AsyncStorage.getItem("authToken");
      const tokenType = (await AsyncStorage.getItem("tokenType")) || "Bearer";
      headers["Accept"] = "application/json";
      if (token) headers["Authorization"] = `${tokenType} ${token}`;
      break;

    default:
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
  }

  return { ...headers, ...extraHeaders };
}

// 🔹 Generic request
async function request(endpoint, method, body = null, headerType = HEADER_TYPES.DEFAULT, extraHeaders = {}) {
  try {
    const headers = await buildHeaders(headerType, extraHeaders);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

// inside request()
  if (!response.ok) {
    let errorMessage = responseData?.detail || responseData?.message || "Request failed";
    return new ApiResponse(false, response.status, errorMessage, responseData);
  }

    return new ApiResponse(true, response.status, "Success", responseData);
  } catch (error) {
    return new ApiResponse(false, 500, error.message || "Network error");
  }
}

// ✅ Easy methods
export async function getRequest(endpoint, headerType = HEADER_TYPES.DEFAULT, extraHeaders = {}) {
  return request(endpoint, "GET", null, headerType, extraHeaders);
}

export async function postRequest(endpoint, body, headerType = HEADER_TYPES.DEFAULT, extraHeaders = {}) {
  return request(endpoint, "POST", body, headerType, extraHeaders);
}
