const debug = require('debug')('service:user')
const to = require('await-to-js').default
const bcrypt = require('bcrypt')
const db = require('./../db')
const ApiError = require('./../exceptions/api-error')
const UserDto = require('./../dtos/user.dto')
const tokenService = require('./token.service')
const AvailableCourseModel = require('./../models/available-course.model')

/**
 * @typedef {object} UserData
 * @property {string|null} login
 * @property {string|null} email
 * @property {string|null} first_name
 * @property {string|null} second_name
 * @property {string} role
 * @property {string|null} phone
 * @property {string} password
 * @property {boolean} is_activated
 * @property {string|null} activation_link
 */

/**
 * @typedef {object} CourseToAddRequest
 * @property {string|number} id
 * @property {string|Date} accessTo
 */

class UserService {
  async getUserById(userId) {
    try {
      const userData = await db.query('SELECT * FROM users WHERE id=$1', [userId])

      if (!userData.rowCount) {
        throw ApiError.BadRequest(`Пользователя с ID=${userId} не существует.`)
      }

      return userData.rows[0]
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * @param {string} login
   * @return {Promise<boolean|UserData>}
   */
  async getUserByLogin(login) {
    try {
      const userData = await db.query('SELECT * FROM users WHERE login=$1', [login])

      if (userData.rows.length === 0) {
        return false
      }

      return userData.rows[0]
    } catch (e) {
      debug('Error occurs when get user by login (%s).', login)
      debug('Error: %O', e)
      throw new Error(e)
    }
  }

  async login(login, password) {
    try {
      const response = await db.query('SELECT * FROM users WHERE login=$1', [login])

      if (response.rows.length === 0) {
        throw `Пользователя с логином ${login} не существует.`
      }

      const userData = response.rows[0]

      const isPassEquals = await bcrypt.compare(password, userData.password)

      if (!isPassEquals) {
        throw 'Указан не правильный пароль.'
      }

      const userDto = new UserDto(userData)

      const tokens = tokenService.generateTokens({ ...userDto })

      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return { ...tokens, user: userDto }
    } catch (e) {
      throw new Error(e)
    }
  }

  async logout(refreshToken) {
    return await tokenService.removeToken(refreshToken)
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

  async createWithLogin(login, password) {
    try {
      const encryptedPassword = await bcrypt.hash(password, 10)

      const dbResponse = await db.query(
        `INSERT INTO users (id, role, password, login)
        VALUES (DEFAULT, 'customer', $1, $2) RETURNING *`,
        [encryptedPassword, login]
      )

      if (dbResponse.rows.length === 0) {
        debug('Failed to create User with login')
        return false
      }

      return {
        id: dbResponse.rows[0].id,
        login,
        password,
      }
    } catch (e) {
      debug('Error when create user with login and password.\nLogin: %s', login)
      debug('Password: %s', password)
      throw new Error(e)
    }
  }

  /**
   * @param {string|number} userId
   * @param {CourseToAddRequest|CourseToAddRequest[]} courses
   * @return {Promise<{error: null, courses: AvailableCourseModel[]}>|Promise<{error: Error|string}>}
   */
  async addCoursesToUser(userId, courses) {
    try {
      if (!Number(userId) > 0) return { error: 'No valid user ID' }

      const [userErr, selectUserResponse] = await to(db.query('SELECT 1 FROM users WHERE id=$1', [userId]))

      if (userErr) return { error: userErr }

      if (selectUserResponse.rows.length === 0) return { error: `No user in database with ID=${userId}` }

      let coursesToArray = !Array.isArray(courses) ? [courses] : courses

      coursesToArray = coursesToArray.map((course) => {
        const date = new Date(course.accessTo)
        const id = Number(course.id)
        const now = new Date()

        if (!date || !id > 0 || date < now) return false

        return { id, accessTo: date }
      })

      let course
      for (course of coursesToArray) {
        if (!course) return { error: 'No valid data in request to add course for user' }

        const [courseErr, selectCourseFromDatabase] = await to(
          db.query('SELECT 1 FROM courses WHERE id=$1', [course.id])
        )

        if (courseErr) return { error: courseErr }

        if (selectCourseFromDatabase.rows.length === 0) return { error: `No course in database with ID=${course.id}` }
      }

      const [existErr, selectExistUserCourses] = await to(
        db.query('SELECT course_id FROM available_courses WHERE user_id=$1', [userId])
      )

      if (existErr) return { error: existErr }

      if (selectExistUserCourses.rows.length > 0) {
        let row
        for (row of selectExistUserCourses.rows) {
          if (
            // prettier-ignore
            coursesToArray
              .map((c) => c.id)
              .includes(Number(row.course_id))
          ) {
            return { error: `User already have course with ID=${row.course_id}` }
          }
        }
      }

      const addedCourses = []
      for (course of coursesToArray) {
        const [attachErr, dbResponse] = await to(
          db.query(
            `INSERT INTO available_courses (id, user_id, course_id, access_to) VALUES (DEFAULT, $1, $2, $3) RETURNING *`,
            [userId, course.id, course.accessTo]
          )
        )

        if (attachErr) return { error: attachErr }

        addedCourses.push(new AvailableCourseModel(dbResponse.rows[0]))
      }

      return { error: null, courses: addedCourses }
    } catch (e) {
      throw e
    }
  }
}

module.exports = new UserService()
