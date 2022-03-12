const debug = require('debug')('model:course-lesson')
const db = require('./../db')

/**
 * @typedef {object} CourseLessonFields
 * @property {string} video src/JSON(resolution + src)
 * @property {string} cover_image
 * @property {string} preview_image
 * @property {string} body
 * @property {string} name
 */

class CourseLessonModel {
  video
  coverImage
  previewImage
  body
  name

  /**
   * @param {CourseLessonFields} data
   */
  constructor(data) {

    /**
     * @public
     * @type {string}
     */
    this.video = data.video

    /**
     * @public
     * @type {string}
     */
    this.coverImage = data.cover_image

    /**
     * @public
     * @type {string}
     */
    this.previewImage = data.preview_image

    /**
     * @public
     * @type {string}
     */
    this.body = data.body

    /**
     * @public
     * @type {string}
     */
    this.name = data.name
  }

  /**
   * @param {number} lessonID
   * @return {Promise<CourseLessonModel|boolean>}
   */
  static async fetchLessonById(lessonID) {
    try {
      if (!Number(lessonID) > 0) {
        return false
      }

      const dbResponse = await db.query('SELECT * FROM course_lessons WHERE id=$1', [lessonID])

      if (dbResponse.rows.length === 0) {
        debug('No find lesson by ID (%s)', lessonID)
        return false
      }

      return new CourseLessonModel(dbResponse.rows[0])
    } catch (e) {
      debug('Error occurs when fetch lesson by ID (%s)', lessonID)
      debug('Error: %O', e)
      throw new Error(e)
    }
  }
}

module.exports = CourseLessonModel
