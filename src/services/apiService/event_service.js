import { getRequest, postRequest, HEADER_TYPES } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";

class EventService {
  // 🔹 Get all events (requires auth token)
  async getEvents() {
    try {
      console.log("=== EventService getEvents Debug ===");
      console.log("Endpoint:", ENDPOINTS.GET_EVENT_LIST);
      console.log("Header Type:", HEADER_TYPES.AUTH);
      
      const response = await getRequest(
        ENDPOINTS.GET_EVENT_LIST,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("=== EventService Events Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);

      // Handle different response structures
      if (response.status === "success" || response.code === 200) {
        return new ApiResponse(true, response.code || 200, response.message || "Events fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to fetch events", response.data);
      }
    } catch (err) {
      console.error("=== EventService getEvents Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse(false, 500, err.message || "Fetching events failed");
    }
  }

  // 🔹 Get event details by ID (requires auth token)
  async getEventDetails(eventId) {
    try {
      const response = await getRequest(
        `${ENDPOINTS.GET_EVENT}/${eventId}`, 
        HEADER_TYPES.AUTH // Bearer token header
      );

      if (response.success && response.data) {
        return new ApiResponse(true, response.code, "Event details fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code, response.message, response.data);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Fetching event details failed");
    }
  }

  // 🔹 Get event categories (requires auth token)
  async getEventCategories(eventId) {
    try {
      const response = await getRequest(
        `${ENDPOINTS.GET_EVENT_CATEGORIES}/${eventId}/categories`,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("Categories API Response:", response);

      // Handle different response structures
      if (response.code === 200) {
        return new ApiResponse(true, response.code, "Categories fetched successfully", response.data);
      } else if (response.status === "success") {
        return new ApiResponse(true, response.code || 200, "Categories fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to fetch categories", response);
      }
    } catch (err) {
      console.error("Categories API Error:", err);
      return new ApiResponse(false, 500, err.message || "Fetching categories failed");
    }
  }

  // 🔹 Get category classes (requires auth token)
  async getCategoryClasses(eventId, categoryId) {
    try {
      const response = await getRequest(
        `${ENDPOINTS.GET_CATEGORY_CLASSES}/${eventId}/categories/${categoryId}/classes`,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("Classes API Response:", response);

      // Handle different response structures
      if (response.code === 200) {
        return new ApiResponse(true, response.code, "Classes fetched successfully", response.data);
      } else if (response.status === "success") {
        return new ApiResponse(true, response.code || 200, "Classes fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to fetch classes", response);
      }
    } catch (err) {
      console.error("Classes API Error:", err);
      return new ApiResponse(false, 500, err.message || "Fetching classes failed");
    }
  }

  // 🔹 Join event (requires auth token)
  async joinEvent(joinData) {
    try {
      console.log("=== EventService joinEvent Debug ===");
      console.log("Join Data:", joinData);
      console.log("Endpoint:", ENDPOINTS.JOIN_EVENT);
      console.log("Header Type: AUTH_RAW (Raw Body)");
      
      const response = await postRequest(
        ENDPOINTS.JOIN_EVENT,
        joinData,
        HEADER_TYPES.AUTH_RAW // Raw body with Bearer token header
      );

      console.log("=== EventService Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);

      // Handle different response structures
      if (response.status === "success" || response.code === 200) {
        return new ApiResponse(true, response.code || 200, response.message || "Event joined successfully", response.data);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to join event", response);
      }
    } catch (err) {
      console.error("=== EventService Join Event Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse(false, 500, err.message || "Joining event failed");
    }
  }
}

export default new EventService();
