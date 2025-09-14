import { getRequest, HEADER_TYPES } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";

class BannerService {
  // 🔹 Get all banners (GET request)
  async getBanners() {
    try {
      console.log("=== BannerService getBanners Debug ===");
      console.log("Endpoint:", ENDPOINTS.GET_BANNERS);
      
      const response = await getRequest(
        ENDPOINTS.GET_BANNERS,
        HEADER_TYPES.AUTH // Bearer token required for banners
      );

      console.log("=== BannerService Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);

      // Handle the API response structure: {status: "success", message: "...", data: [...]}
      if (response.status === "success" || response.code === 200) {
        // Extract the banners data from response.data.data (since API wraps data in data object)
        const banners = response.data?.data || response.data || [];
        console.log("Extracted banners array:", banners);
        
        return new ApiResponse(true, response.code || 200, response.message || "Banners fetched successfully", banners);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to fetch banners", []);
      }
    } catch (err) {
      console.error("=== BannerService getBanners Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse(false, 500, err.message || "Fetching banners failed", []);
    }
  }
}

export default new BannerService();
