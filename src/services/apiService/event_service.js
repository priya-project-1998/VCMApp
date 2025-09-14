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

      // Handle the API response structure: {status: "success", events: [...]}
      if (response.status === "success" || response.code === 200) {
        // Extract the events data from response.data.events
        const events = response.data?.events || [];
        console.log("Extracted events array:", events);
        
        return new ApiResponse("success", response.code || 200, response.message || "Events fetched successfully", events);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch events", []);
      }
    } catch (err) {
      console.error("=== EventService getEvents Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse("error", 500, err.message || "Fetching events failed", []);
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
        return new ApiResponse("success", response.code, "Event details fetched successfully", response.data);
      } else {
        return new ApiResponse("error", response.code, response.message, response.data);
      }
    } catch (err) {
      return new ApiResponse("error", 500, err.message || "Fetching event details failed");
    }
  }

  // 🔹 Get event categories (requires auth token)
  async getEventCategories(eventId) {
    try {
      console.log("=== EventService getEventCategories Debug ===");
      console.log("Event ID:", eventId);
      console.log("Endpoint:", `${ENDPOINTS.GET_EVENT_CATEGORIES}/${eventId}/categories`);
      
      const response = await getRequest(
        `${ENDPOINTS.GET_EVENT_CATEGORIES}/${eventId}/categories`,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("=== Categories API Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);
      console.log("Response Data Categories:", response.data?.categories);

      // Handle the API response structure: {data: {status: "success", user_id: "25", categories: [...]}}
      if (response.status === "success" || response.code === 200) {
        // Extract categories from response.data.categories (nested structure)
        const categories = response.data?.categories || [];
        console.log("Extracted categories array:", categories);
        console.log("Categories count:", categories.length);
        
        return new ApiResponse("success", response.code || 200, response.message || "Categories fetched successfully", categories);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch categories", []);
      }
    } catch (err) {
      console.error("=== EventService getEventCategories Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse("error", 500, err.message || "Fetching categories failed", []);
    }
  }

  // 🔹 Get category classes (requires auth token)
  async getCategoryClasses(eventId, categoryId) {
    try {
      console.log("=== EventService getCategoryClasses Debug ===");
      console.log("Event ID:", eventId);
      console.log("Category ID:", categoryId);
      console.log("Endpoint:", `${ENDPOINTS.GET_CATEGORY_CLASSES}/${eventId}/categories/${categoryId}/classes`);
      
      const response = await getRequest(
        `${ENDPOINTS.GET_CATEGORY_CLASSES}/${eventId}/categories/${categoryId}/classes`,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("=== Classes API Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);
      console.log("Response Classes:", response.classes);
      console.log("Response Data Classes:", response.data?.classes);

      // Handle the API response structure: {status: "success", classes: [...]}
      if (response.status === "success" || response.code === 200) {
        // Classes are directly in the response.classes array
        let classes = [];
        
        if (response.classes && Array.isArray(response.classes)) {
          // Structure: {status: "success", classes: [...]}
          classes = response.classes;
          console.log("Found classes in response.classes:", classes);
        } else if (response.data?.classes) {
          // Structure: {data: {classes: [...]}}
          classes = response.data.classes;
          console.log("Found classes in response.data.classes:", classes);
        } else if (Array.isArray(response.data)) {
          // Structure: {data: [...]} (direct array)
          classes = response.data;
          console.log("Found classes as direct array in response.data:", classes);
        } else {
          // Fallback - try to find any array in the response
          console.log("Trying to find classes in response structure...");
          console.log("Available keys in response:", Object.keys(response));
          console.log("Available keys in response.data:", Object.keys(response.data || {}));
          classes = [];
        }
        
        console.log("Final extracted classes array:", classes);
        console.log("Classes count:", classes.length);
        
        return new ApiResponse("success", response.code || 200, response.message || "Classes fetched successfully", classes);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch classes", []);
      }
    } catch (err) {
      console.error("=== EventService getCategoryClasses Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse("error", 500, err.message || "Fetching classes failed", []);
    }
  }

    // 🔹 Join event (requires auth token)
  async joinEvent(joinData) {
    try {
      console.log("=== EventService joinEvent Debug ===");
      console.log("Join Data:", joinData);
      console.log("Endpoint:", ENDPOINTS.JOIN_EVENT);
      console.log("Header Type: AUTH (Standard JSON)");
      
      // Validate join data before sending
      if (!joinData.event_id || !joinData.category_id || !joinData.class_id) {
        throw new Error("Missing required fields: event_id, category_id, or class_id");
      }
      
      if (!joinData.crew_members || joinData.crew_members.length === 0) {
        throw new Error("At least one crew member is required");
      }
      
      const response = await postRequest(
        ENDPOINTS.JOIN_EVENT,
        joinData,
        HEADER_TYPES.AUTH // Standard JSON with Bearer token header
      );

      console.log("=== EventService Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);

      // Handle different response structures
      if (response.status === "success" || response.code === 200) {
        return new ApiResponse("success", response.code || 200, response.message || "Event joined successfully", response.data);
      } else {
        // Return error with proper message
        const errorMessage = response.message || response.error || "Failed to join event";
        return new ApiResponse("error", response.code || 500, errorMessage, response);
      }
    } catch (err) {
      console.error("=== EventService Join Event Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      
      // Handle different types of errors
      if (err.message.includes("Missing required fields")) {
        return new ApiResponse("error", 400, err.message, null);
      } else if (err.message.includes("crew member")) {
        return new ApiResponse("error", 400, err.message, null);
      } else {
        return new ApiResponse("error", 500, err.message || "Network error while joining event", null);
      }
    }
  }

  // 🔹 Get my events (requires auth token)
  async getMyEvents() {
    try {
      console.log("=== EventService getMyEvents Debug ===");
      console.log("Endpoint:", ENDPOINTS.GET_MY_EVENTS);
      console.log("Header Type:", HEADER_TYPES.AUTH);
      
      const response = await getRequest(
        ENDPOINTS.GET_MY_EVENTS,
        HEADER_TYPES.AUTH // Bearer token header
      );

      console.log("=== EventService My Events Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);
      console.log("Response Data Type:", typeof response.data);
      console.log("Response Data is Array:", Array.isArray(response.data));
      
      if (response.data && typeof response.data === 'object') {
        console.log("Response Data Keys:", Object.keys(response.data));
      }

      // Handle the API response structure
      if (response.status === "success" || response.code === 200) {
        // Extract the events data from response.data - try different structures
        let myEvents = [];
        
        if (response.data?.events) {
          // Structure like getEvents: {data: {events: [...]}}
          myEvents = response.data.events;
          console.log("Found events in response.data.events:", myEvents);
        } else if (Array.isArray(response.data)) {
          // Direct array: {data: [...]}
          myEvents = response.data;
          console.log("Found events as direct array in response.data:", myEvents);
        } else if (response.data?.myEvents) {
          // Possible structure: {data: {myEvents: [...]}}
          myEvents = response.data.myEvents;
          console.log("Found events in response.data.myEvents:", myEvents);
        } else {
          // Fallback - try to find any array in data
          console.log("Trying to find events in response structure...");
          console.log("Available keys in response.data:", Object.keys(response.data || {}));
          myEvents = [];
        }
        
        console.log("Final extracted my events array:", myEvents);
        console.log("My events count:", myEvents.length);
        
        return new ApiResponse("success", response.code || 200, response.message || "My events fetched successfully", myEvents);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch my events", []);
      }
    } catch (err) {
      console.error("=== EventService getMyEvents Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse("error", 500, err.message || "Fetching my events failed", []);
    }
  }
}

export default new EventService();
