// src/model/login_request_model.js

export default class LoginRequestModel {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  static fromJson(json) {
    if (!json) return null;
    return new LoginRequestModel(json.email, json.password);
  }

  toJson() {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
