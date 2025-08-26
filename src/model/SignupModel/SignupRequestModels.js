// ---------------- Request Models ----------------
class RequestOtpModel {
  constructor(email) {
    this.email = email;
  }
  toJson() {
    return { email: this.email };
  }
}

class VerifyOtpModel {
  constructor(email, otp) {
    this.email = email;
    this.otp = otp;
  }
  toJson() {
    return { email: this.email, otp: this.otp };
  }
}

// ---------------- Register Request Model ----------------
class RegisterRequestModel {
  constructor({ name, mobile, email, password, address, city, state, pincode, profileImage }) {
    this.name = name || "";
    this.mobile = mobile || "";
    this.email = email || "";
    this.password = password || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
    this.profileImage = profileImage || null; // { uri, type, name }
  }

  toFormData() {
    const formData = new FormData();
    formData.append("name", this.name);
    formData.append("mobile", this.mobile);
    formData.append("email", this.email);
    formData.append("password", this.password);
    formData.append("address", this.address);
    formData.append("city", this.city);
    formData.append("state", this.state);
    formData.append("pincode", this.pincode);

    // ✅ File upload properly handled
    if (this.profileImage && this.profileImage.uri) {
      formData.append("profile_image", {
        uri: this.profileImage.uri,
        type: this.profileImage.type || "image/jpeg",
        name: this.profileImage.name || "profile.jpg",
      });
    }

    return formData;
  }
}

export { RequestOtpModel, VerifyOtpModel, RegisterRequestModel };
