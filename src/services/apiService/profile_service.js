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
        return new ApiResponse(true, 200, "Profile fetched successfully", userProfile);
      } else {
        return new ApiResponse(false, res.code || 500, res.message || "Failed to fetch profile", null);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Fetching profile failed", null);
    }
  }

    // 🔹 Update User Profile (fixed)
async updateUserProfile(updateData) {
  try {
    const requestBody = new UserProfileUpdateRequestModel(updateData).toJson();

    // Add console log to check image filename in request body
    console.log("[UpdateProfile] Request Body:", requestBody);

    const res = await postRequest(
      ENDPOINTS.UPDATE_PROFILE,
      requestBody,
      HEADER_TYPES.AUTH
    );

    // Log the full API response for success/failure debugging
    console.log("[UpdateProfile] API Response:", res);

    const userObj = res?.data?.user || null;

    // try matching what backend actually sends
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
