// models/signup/SignupResponseModel.js

// ---------------- Register User Data ----------------
class RegisterUserData {
  constructor({
    id,
    name,
    username,
    email,
    mobile,
    address,
    city,
    state,
    pincode,
    created_at,
  }) {
    this.id = id || null;
    this.name = name || "";
    this.username = username || "";
    this.email = email || "";
    this.mobile = mobile || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
    this.createdAt = created_at || "";
  }

  static fromJson(json) {
    if (!json) return null;
    return new RegisterUserData({
      id: json.id,
      name: json.name,
      username: json.username,
      email: json.email,
      mobile: json.mobile,
      address: json.address,
      city: json.city,
      state: json.state,
      pincode: json.pincode,
      created_at: json.created_at,
    });
  }
}

// ---------------- Register Response ----------------
class RegisterResponseModel {
  constructor({ success, code, message, data }) {
    this.success = success || false;
    this.code = code || 500;
    this.message = message || "";
    this.data = data ? RegisterUserData.fromJson(data) : null;
  }

  static fromJson(json) {
    if (!json) return new RegisterResponseModel({});
    return new RegisterResponseModel({
      success: json.success,
      code: json.code,
      message: json.message,
      data: json.data,
    });
  }
}

// ---------------- Verify OTP Response ----------------
class VerifyOtpResponseModel {
  constructor({ success, code, message }) {
    this.success = success || false;
    this.code = code || 500;
    this.message = message || "";
  }

  static fromJson(json) {
    if (!json) return new VerifyOtpResponseModel({});
    return new VerifyOtpResponseModel({
      success: json.success,
      code: json.code,
      message: json.message,
    });
  }
}

export { RegisterUserData, RegisterResponseModel, VerifyOtpResponseModel };
