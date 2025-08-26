// ---------------- Response Models ----------------

class RequestOtpResponseModel {
  constructor({ message }) {
    this.message = message;
  }

  static fromJson(json) {
    return new RequestOtpResponseModel({
      message: json.message,
    });
  }
}

class VerifyOtpResponseModel {
  constructor({ message }) {
    this.message = message;
  }

  static fromJson(json) {
    return new VerifyOtpResponseModel({
      message: json.message,
    });
  }
}

// ✅ Register user data model
class RegisterUserData {
  constructor({
    id,
    name,
    email,
    mobile,
    address,
    city,
    state,
    pincode,
    profile_image,
    created_at,
  }) {
    this.id = id || null;
    this.name = name || "";
    this.email = email || "";
    this.mobile = mobile || "";
    this.address = address || "";
    this.city = city || "";
    this.state = state || "";
    this.pincode = pincode || "";
    this.profileImage = profile_image || null;
    this.createdAt = created_at || "";
  }

  static fromJson(json) {
    if (!json) return null;
    return new RegisterUserData({
      id: json.id,
      name: json.name,
      email: json.email,
      mobile: json.mobile,
      address: json.address,
      city: json.city,
      state: json.state,
      pincode: json.pincode,
      profile_image: json.profile_image,
      created_at: json.created_at,
    });
  }
}

// ✅ Register response model
class RegisterResponseModel {
  constructor({ success, code, message, data }) {
    this.success = success || false;
    this.code = code || 500;
    this.message = message || "";
    this.data = data ? RegisterUserData.fromJson(data) : null; // ✅ Only convert once
  }

  static fromJson(json) {
    if (!json) return new RegisterResponseModel({});
    return new RegisterResponseModel({
      success: json.success,
      code: json.code,
      message: json.message,
      data: json.data, // Already converted in constructor
    });
  }
}


export {
  RequestOtpResponseModel,
  VerifyOtpResponseModel,
  RegisterResponseModel,
  RegisterUserData,
};
