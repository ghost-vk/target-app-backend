module.exports = class UserDto {
  login
  email
  id
  role

  constructor(model) {
    this.login = model.login
    this.email = model.email
    this.id = model.id
    this.role = model.role
  }
}
