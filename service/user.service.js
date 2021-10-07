const db = require('./../db')
const ApiError = require('./../exceptions/api-error')
const bcrypt = require('bcrypt')
const UserDto = require('./../dtos/user.dto')
const tokenService = require('./token.service')

class UserService {
  async getUserById(userId) {
    const userData = await db.query('SELECT * FROM users WHERE id=$1', [userId])
    if (!userData.rowCount) {
      throw ApiError.BadRequest(`Пользователя с ID=${userId} не существует.`)
    }
    return userData.rows[0]
  }

  async login(email, password) {
    const response = await db.query('SELECT * FROM users WHERE email=$1', [
      email,
    ])
    const userData = response.rows[0] || false
    if (!userData) {
      throw ApiError.BadRequest(
        `Пользователя с Email ${email} не существует.`
      )
    }
    const isPassEquals = await bcrypt.compare(password, userData.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest(`Указан не правильный пароль.`)
    }
    const userDto = new UserDto(userData)
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }

    const user = await this.getUserById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }
}

module.exports = new UserService()
