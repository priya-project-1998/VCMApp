// ApiService.js
import axios from "axios";
import Config from "./config";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: Config.BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": Config.CONTENT_TYPE,
        Accept: Config.ACCEPT,
      },
    });
  }

  getApi() {
    return this.api;
  }
}

export default new ApiService();
