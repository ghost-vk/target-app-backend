const jwt = require('jsonwebtoken')
const db = require('./../db')

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '30m',
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '60d',
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch (e) {
      return null
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch (e) {
      return null
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await db.query('SELECT * FROM tokens WHERE user_id=$1', [
      userId,
    ])

    let newTokenData

    if (tokenData.rows.length > 0) {
      // already registered
      newTokenData = await db.query(
        'UPDATE tokens SET refresh_token=$1 WHERE user_id=$2 RETURNING *',
        [refreshToken, userId]
      )
      return newTokenData.rows[0]
    } else {
      // new user
      newTokenData = await db.query(
        'INSERT INTO tokens(user_id, refresh_token) VALUES($1, $2) RETURNING *',
        [userId, refreshToken]
      )
      return newTokenData.rows[0]
    }
  }

  async removeToken(refreshToken) {
    const tokenData = await db.query(
      `DELETE FROM tokens WHERE refresh_token=$1 RETURNING *`,
      [refreshToken]
    )

    return tokenData.rows[0] || {}
  }

  async findToken(refreshToken) {
    const tokenData = await db.query(
      'SELECT * FROM tokens WHERE refresh_token=$1',
      [refreshToken]
    )

    return tokenData.rows[0] || false
  }
}

module.exports = new TokenService()
