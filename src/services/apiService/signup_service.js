import { postRequest, HEADER_TYPES } from "../api";
import ENDPOINTS from "../endpoints";
import ApiResponse from "../ApiResponse";
import {RequestOtpModel, VerifyOtpModel, RegisterRequestModel} from "../../model/SignupModel/SignupRequestModels";
import {RequestOtpResponseModel,VerifyOtpResponseModel,RegisterResponseModel} from "../../model/SignupModel/SignupResponseModels";


class SignupService {
  // 🔹 Step 1: Request OTP
  async requestOtp(email) {
    try {
      const requestModel = new RequestOtpModel(email);
      const response = await postRequest(
        ENDPOINTS.REQUEST_OTP,
        requestModel.toJson(),
        HEADER_TYPES.DEFAULT
      );

      if (response.success && response.data) {
        const data = RequestOtpResponseModel.fromJson(response.data);
        return new ApiResponse(true, response.code, data.message, data);
      } else {
        return new ApiResponse(false, response.code, response.message, response.data);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Request OTP failed");
    }
  }

  // 🔹 Step 2: Verify OTP
  async verifyOtp(email, otp) {
    try {
      const requestModel = new VerifyOtpModel(email, otp);
      const response = await postRequest(
        ENDPOINTS.VERIFY_OTP,
        requestModel.toJson(),
        HEADER_TYPES.DEFAULT
      );

      if (response.success && response.data) {
        const data = VerifyOtpResponseModel.fromJson(response.data);
        return new ApiResponse(true, response.code, data.message, data);
      } else {
        return new ApiResponse(false, response.code, response.message, response.data);
      }
    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Verify OTP failed");
    }
  }

// 🔹 Step 3: Register User (FormData)
  async registerUser(userData) {
    try {
      // ✅ Request model
      const requestModel = new RegisterRequestModel(userData);

      // ✅ Convert to FormData
      const formData = requestModel.toFormData();

    // 🔹 Debug: log FormData
      console.log("📦 FormData Contents:");
      if (formData && formData._parts) {
        formData._parts.forEach(([key, value], index) => {
          if (value && value.uri) {
            console.log(`${index}: ${key} => [FILE] uri: ${value.uri}, type: ${value.type}, name: ${value.name}`);
          } else {
            console.log(`${index}: ${key} => ${value}`);
          }
        });
      } else {
        console.log("FormData is empty or not accessible via _parts");
      }


      // ✅ API call with multipart/form-data header
      const response = await postRequest(
        ENDPOINTS.REGISTER,
        formData,
        HEADER_TYPES.FORMDATA
      );

      if (response.success && response.data) {
        const data = RegisterResponseModel.fromJson(response.data);
        return new ApiResponse(true, response.code, data.message, data);
      } else {
        return new ApiResponse(false, response.code, response.message, response.data);
      }

    } catch (err) {
      return new ApiResponse(false, 500, err.message || "Register failed");
    }
  }
}

export default new SignupService();
