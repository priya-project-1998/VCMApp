// src/model/UserProfileResponse.js
import UserProfileModel from "../UserProfileModel";

class UserProfileUpdateResponseModel {
  constructor(data) {
    this.status = data?.status || "";
    this.message = data?.message || "";
    this.user = data?.user ? new UserProfileModel(data.user) : null;
  }
}

export default UserProfileUpdateResponseModel;
