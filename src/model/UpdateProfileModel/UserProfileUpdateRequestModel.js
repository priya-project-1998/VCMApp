// src/model/UserProfileUpdateRequest.js
class UserProfileUpdateRequestModel {
  constructor({ name, contact, address, city, state, pincode }) {
    this.name = name || "";
    this.contact = contact || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
  }
}

export default UserProfileUpdateRequestModel;
