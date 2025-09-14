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
        HEADER_TYPES.DEFAULT // No auth required for banners
      );

      console.log("=== BannerService Response Debug ===");
      console.log("Raw Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);

      // Handle different response structures
      if (response.status === "success" || response.code === 200) {
        return new ApiResponse(true, response.code || 200, response.message || "Banners fetched successfully", response.data);
      } else {
        return new ApiResponse(false, response.code || 500, response.message || "Failed to fetch banners", response.data);
      }
    } catch (err) {
      console.error("=== BannerService getBanners Error ===");
      console.error("Error:", err);
      console.error("Error Message:", err.message);
      return new ApiResponse(false, 500, err.message || "Fetching banners failed");
    }
  }
}

export default new BannerService();
