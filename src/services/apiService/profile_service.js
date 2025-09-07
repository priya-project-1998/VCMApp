import { getRequest, postRequest } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";
import { HEADER_TYPES } from "../api";
import UserProfileModel from "../../model/UserProfileModel";
import UserProfileUpdateRequestModel from "../../model/UpdateProfileModel/UserProfileUpdateRequestModel";
import UserProfileUpdateResponseModel from "../../model/UpdateProfileModel/UserProfileUpdateResponseModel";

class ProfileService {
  // 🔹 Get User Profile Details
  async getUserProfile() {
    try {
      const response = await postRequest(
        ENDPOINTS.GET_USER_PROFILE_DETAIL,
        HEADER_TYPES.AUTH
      );

      if (response.code === 200) {
        const userProfile = new UserProfileModel(response.data.user);
        return new ApiResponse(true, response.code, "User profile fetched successfully", userProfile);
      } else {
        return new ApiResponse(false, response.code, response.message, null);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Fetching profile failed", null);
    }
  }

  // 🔹 Update User Profile
  async updateUserProfile(updateData) {
    try {
      const requestData = new UserProfileUpdateRequestModel(updateData);

      const response = await postRequest(
        ENDPOINTS.UPDATE_USER_PROFILE_UPDATE,
        requestData,
        HEADER_TYPES.AUTH
      );

      if (response.code === 200) {
        const updatedProfile = new UserProfileUpdateResponseModel(response.data);
        return new ApiResponse(true, response.code, updatedProfile.message, updatedProfile.user);
      } else {
        return new ApiResponse(false, response.code, response.message, null);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Updating profile failed", null);
    }
  }
}

export default new ProfileService();
