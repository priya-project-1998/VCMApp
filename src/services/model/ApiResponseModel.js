export default class ApiResponseModel {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  isSuccess() {
    return this.statusCode >= 200 && this.statusCode < 300;
  }
}
