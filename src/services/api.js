import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiResponse from "./ApiResponse";

const BASE_URL = "http://trail-hunt.randomsoftsolution.in:8000/api";

// 🔹 Header types
export const HEADER_TYPES = {
  DEFAULT: "default",   // Content-Type + Accept
  ACCEPT: "acceptOnly", // Accept only
  AUTH: "auth", 
  FORMDATA: "formData"  // multipart/form-data (no Content-Type here)
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
      if (token) {
        headers["Accept"] = "application/json";
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn("Auth token not found in AsyncStorage");
      }
      break;
    
    case HEADER_TYPES.FORMDATA:
      headers["Accept"] = "application/json";
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

    let requestBody = null;
    if (body) {
      if (headerType === HEADER_TYPES.FORMDATA) {
        requestBody = body; // direct FormData
      } else {
        requestBody = JSON.stringify(body);
      }
    }

console.log("📤 API Request:", {
  url: `${BASE_URL}${endpoint}`,
  method,
  headers,
  body: headerType === HEADER_TYPES.FORMDATA ? "FormData" : requestBody
});

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      //body: body ? JSON.stringify(body) : null,
      body: requestBody,

    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    console.log("📥 API Response:", response.status, responseData);


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
    console.log("🔎 getRequest called with:", {
    endpoint,
    headerType,
    extraHeaders
  });
  return request(endpoint, "GET", null, headerType, extraHeaders);
}

export async function postRequest(endpoint, body, headerType = HEADER_TYPES.DEFAULT, extraHeaders = {}) {
  return request(endpoint, "POST", body, headerType, extraHeaders);
}
