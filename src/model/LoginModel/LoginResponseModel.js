export default class LoginResponseModel {
  constructor(accessToken, tokenType) {
    this.access_token = accessToken;
    this.token_type = tokenType;
  }

  static fromJson(json) {
    if (!json) return null;
    return new LoginResponseModel(json.access_token, json.token_type);
  }
}
