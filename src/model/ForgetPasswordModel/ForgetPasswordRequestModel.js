export class ForgetPasswordRequestModel {
  constructor(email, newPassword) {
    this.email = email;
    this.new_password = newPassword;
  }

  toJson() {
    return {
      email: this.email,
      new_password: this.new_password,
    };
  }
}
