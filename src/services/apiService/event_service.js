import { getRequest } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";
import { HEADER_TYPES } from "../api";

class EventService {
  // 🔹 Get all events (requires auth token)
  async getEvents() {
    try {
      const response = await getRequest(
        ENDPOINTS.GET_EVENT_LIST,
        HEADER_TYPES.AUTH // Bearer token header
      );

      if (response.code === 200) {
       
        return new ApiResponse(true, response.code, "Events fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code, response.message, response.data);
      }
    } catch (err) {
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
}

export default new EventService();
