export class ForgetPasswordResponseModel {
  constructor(message) {
    this.message = message;
  }

  static fromJson(json) {
    return new ForgetPasswordResponseModel(json.message || "");
  }
}
