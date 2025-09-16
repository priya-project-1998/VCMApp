import { postRequest } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";
import { HEADER_TYPES } from "../api";
import UserProfileModel from "../../model/UserProfileModel";
import UserProfileUpdateRequestModel from "../../model/UpdateProfileModel/UserProfileUpdateRequestModel";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        return new ApiResponse(true, 200, "Profile fetched successfully", userProfile);
      } else {
        return new ApiResponse(false, res.code || 500, res.message || "Failed to fetch profile", null);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Fetching profile failed", null);
    }
  }

  // 🔹 Update User Profile (with profile pic support)
  async updateUserProfile(updateData, isMultipart = false) {
    try {
      let requestBody;
      let headerType;
      
      if (isMultipart) {
        // Use FormData for file upload
        requestBody = updateData; // Assume it's already FormData
        headerType = HEADER_TYPES.AUTH_FORMDATA;
        console.log("📤 Using FormData for file upload");
      } else {
        // Use JSON for regular update
        const requestModel = new UserProfileUpdateRequestModel(updateData);
        requestBody = requestModel.toJson();
        headerType = HEADER_TYPES.AUTH;
        console.log("📤 Using JSON for regular update");
      }

      console.log("📤 API Request URL:", ENDPOINTS.UPDATE_PROFILE);
      console.log("📤 API Headers Type:", headerType);

      const res = await postRequest(
        ENDPOINTS.UPDATE_PROFILE,
        requestBody,
        headerType
      );

      console.log("📥 API Raw Response:", JSON.stringify(res, null, 2));

      const userObj = res?.data?.user || null;
      console.log("📥 userObj Raw Response:", userObj);

      // Check response status
      if ((res.status === "success" || res.success === true) && userObj) {
        const updatedProfile = new UserProfileModel(userObj);
        return new ApiResponse(true, 200, res.message || "Profile updated successfully", updatedProfile);
      } else {
        return new ApiResponse(false, res.code || 500, res.message || "Profile update failed", null);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Profile update failed", null);
    }
  }
}

export default new ProfileService();
