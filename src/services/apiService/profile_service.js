import { postRequest } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";
import { HEADER_TYPES } from "../api";
import UserProfileModel from "../../model/UserProfileModel";
import UserProfileUpdateRequestModel from "../../model/UpdateProfileModel/UserProfileUpdateRequestModel";

class ProfileService {
  // 🔹 Get User Profile (unchanged)
  async getUserProfile() {
    try {
      const res = await postRequest(
        ENDPOINTS.GET_USER_PROFILE_DETAIL,
        null,
        HEADER_TYPES.AUTH
      );

      const userObj = res?.data?.user || null;

      if (res.status === "success" && userObj) {
        const userProfile = new UserProfileModel(userObj);
        console.log("📌 getUserProfile - userProfile response:", userProfile);
        return new ApiResponse(true, 200, "Profile fetched successfully", userProfile);
      } else {
        return new ApiResponse(false, res.code || 500, res.message || "Failed to fetch profile", null);
      }
    } catch (err) {
      console.error("❌ getUserProfile - error:", err);
      return new ApiResponse(false, 500, err.message || "Fetching profile failed", null);
    }
  }

    // 🔹 Update User Profile (fixed)
  async updateUserProfile(updateData) {
    try {
      // Convert model to plain JSON
      const requestBody = new UserProfileUpdateRequestModel(updateData).toJson();

      // Send POST request with Authorization & Content-Type automatically added
      const res = await postRequest(
        ENDPOINTS.UPDATE_PROFILE,
        requestBody,
        HEADER_TYPES.AUTH
      );

      console.log("📌 updateUserProfile - full response:", res);

      const userObj = res?.data?.user || null;

      if (res.status === "success" && userObj) {
        const updatedProfile = new UserProfileModel(userObj);
        return new ApiResponse(true, 200, res.message || "Profile updated successfully", updatedProfile);
      } else {
        return new ApiResponse(false, res.code || 500, res.message || "Profile update failed", null);
      }
    } catch (err) {
      console.error("❌ updateUserProfile - error:", err);
      return new ApiResponse(false, 500, err.message || "Profile update failed", null);
    }
  }

}

export default new ProfileService();
