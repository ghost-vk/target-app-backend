const debug = require('debug')('model:course')
const db = require('./../db')
const { dateToDDMMYYYY } = require('./../filters/date')
const CourseLessonModel = require('./course-lesson.model')

/**
 * @typedef CourseFields
 * @property {string} lessons
 * @property {string} name
 * @property {string} description
 * @property {string|Date} release
 * @property {string|Date} last_update
 * @property {string} image
 */

class CourseModel {
  lessonsIds
  name
  description
  release
  lastUpdate
  image
  accessToDate
  accessToString
  lessons

  /**
   * @param {CourseFields} data
   */
  constructor(data) {
    /**
     * @public
     * @type {string[]}
     */
    this.lessonsIds = data.lessons.split(',')

    /**
     * @public
     * @type {string}
     */
    this.name = data.name

    /**
     * @public
     * @type {string}
     */
    this.description = data.description

    const releaseDate = data.release instanceof Date ? data.release : new Date(data.release)

    /**
     * @public
     * @type {boolean|string}
     */
    this.release = dateToDDMMYYYY(releaseDate)

    const lastUpdate = data.last_update instanceof Date ? data.last_update : new Date(data.last_update)

    /**
     * @public
     * @type {boolean|string}
     */
    this.lastUpdate = dateToDDMMYYYY(lastUpdate)

    /**
     * Thumbnail relative src path.
     * @public
     * @type {string}
     */
    this.image = data.image
  }

  /**
   * @param {number} id
   * @return {Promise<boolean|CourseModel>}
   */
  static async fetchCourseById(id) {
    try {
      if (!Number(id) > 0) {
        return false
      }

      const dbResponse = await db.query(`SELECT * FROM courses WHERE id=$1`, [id])

      debug('Database query: SELECT * FROM courses WHERE id=%s', id)
      debug('Response: %O', dbResponse.rows)

      if (dbResponse.rows.length === 0) {
        return false
      }

      return new CourseModel(dbResponse.rows[0])
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * @param {object} date
   * @param {string} date.string
   * @param {Date} date.date
   */
  setAccessToDate(date) {
    /**
     * @type {Date}
     */
    this.accessToDate = date.date

    /**
     * @type {string}
     */
    this.accessToString = date.string
  }

  /**
   * @param {CourseLessonModel} lesson
   * @return {boolean}
   */
  pushLessonInCourse(lesson) {
    if (!lesson instanceof CourseLessonModel) {
      return false
    }

    if (!Array.isArray(this.lessons)) {
      this.lessons = []
    }

    this.lessons.push(lesson)

    return true
  }
}

module.exports = CourseModel
