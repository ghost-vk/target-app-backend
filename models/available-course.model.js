const { dateToDDMMYYYY } = require('./../filters/date')

/**
 * @typedef {object} AvailableCoursesFields
 * @property {number} user_id
 * @property {number} course_id
 * @property {string|Date} access_to
 */

class AvailableCourseModel {
  userId
  courseId
  accessToDate
  accessToString

  /**
   * @param {AvailableCoursesFields} data
   */
  constructor(data) {
    /**
     * @public
     * @type {number}
     */
    this.userId = data.user_id

    /**
     * @public
     * @type {number}
     */
    this.courseId = data.course_id

    const accessTo = data.access_to
      ? data.access_to instanceof Date
        ? data.access_to
        : new Date(data.access_to)
      : null

    /**
     * @public
     * @type {boolean|string}
     */
    this.accessToString = accessTo ? dateToDDMMYYYY(accessTo) : null

    /**
     * @public
     * @type {Date}
     */
    this.accessToDate = accessTo
  }
}

module.exports = AvailableCourseModel
