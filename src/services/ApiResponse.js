export default class ApiResponse {
  constructor(success, code, message, data = null) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
