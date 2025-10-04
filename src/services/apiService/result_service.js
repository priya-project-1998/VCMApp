import { getRequest, postRequest, HEADER_TYPES } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";

class ResultService {

  // 🔹 Get my events (requires auth token)
  async getMyEvents() {
    try {
      const response = await getRequest(
        ENDPOINTS.GET_MY_EVENTS,
        HEADER_TYPES.AUTH // Bearer token header
      );

      // Handle the API response structure
      if (response.status === "success" || response.code === 200) {
        // Extract the events data from response.data - try different structures
        let myEvents = [];
        
        if (response.data?.events) {
          // Structure like getEvents: {data: {events: [...]}}
          myEvents = response.data.events;
        } else if (Array.isArray(response.data)) {
          // Direct array: {data: [...]}
          myEvents = response.data;
        } else if (response.data?.myEvents) {
          // Possible structure: {data: {myEvents: [...]}}
          myEvents = response.data.myEvents;
        } else {
          // Fallback - try to find any array in data
          myEvents = [];
        }
        
        return new ApiResponse("success", response.code || 200, response.message || "My events fetched successfully", myEvents);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch my events", []);
      }
    } catch (err) {
      return new ApiResponse("error", 500, err.message || "Fetching my events failed", []);
    }
  }

  // 🔹 Get user result for a specific event (requires auth token)
  async getUserResultPerEvent(eventId) {
    try {
      const response = await getRequest(
        `${ENDPOINTS.GET_PER_EVENT_RESULTS}${eventId}`,
        HEADER_TYPES.AUTH // Bearer token header
      );
      if ((response.status === "success" || response.code === 200) && response.data.config) {
        const config = response.data.config || null;
        return new ApiResponse("success", response.code || 200, response.message || "Config fetched successfully", config);
      } else {
        return new ApiResponse("error", response.code || 500, response.message || "Failed to fetch config", null);
      }
    } catch (err) {
      return new ApiResponse("error", 500, err.message || "Fetching config failed", null);
    }
  }
}

export default new ResultService();
