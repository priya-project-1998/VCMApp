// models/UpdateProfileModel/UserProfileUpdateRequestModel.js
class UserProfileUpdateRequestModel {
  constructor({ name, contact, address, city, state, pincode, profile_pic }) {
    this.name = name || "";
    this.contact = contact || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
    this.profile_pic = profile_pic || null;
  }

  toJson() {
    return {
      name: this.name,
      contact: this.contact,
      address: this.address,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      profile_pic: this.profile_pic,
    };
  }

  toFormData() {
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('contact', this.contact);
    formData.append('address', this.address);
    formData.append('city', this.city);
    formData.append('state', this.state);
    formData.append('pincode', this.pincode);
    
    if (this.profile_pic) {
      formData.append('profile_pic', this.profile_pic);
    }
    
    return formData;
  }
}

export default UserProfileUpdateRequestModel;
