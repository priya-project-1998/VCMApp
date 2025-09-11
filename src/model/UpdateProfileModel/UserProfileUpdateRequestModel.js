// models/UpdateProfileModel/UserProfileUpdateRequestModel.js
class UserProfileUpdateRequestModel {
  constructor({ name, contact, address, city, state, pincode }) {
    this.name = name || "";
    this.contact = contact || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
  }

  toJson() {
    return {
      name: this.name,
      contact: this.contact,
      address: this.address,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
    };
  }
}

export default UserProfileUpdateRequestModel;
