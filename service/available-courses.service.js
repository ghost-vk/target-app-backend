const db = require('./../db')
const CourseModel = require('./../models/course.model')
const CourseLessonModel = require('./../models/course-lesson.model')
const debug = require('debug')('service:available-courses')

class AvailableCoursesService {
  /**
   * @static
   * @param {number} userId
   * @return {Promise<boolean|CourseModel[]>}
   */
  static async getAvailableCoursesForUserById(userId) {
    try {
      if (!Number(userId) > 0) return false

      const dbResponse = await db.query(
        `SELECT c.*, access_to FROM available_courses
           LEFT JOIN courses c ON c.id = available_courses.course_id
         WHERE user_id=$1 AND access_to > NOW();`,
        [userId]
      )

      if (dbResponse.rows.length === 0) return false

      const batch = []

      for (let row of dbResponse.rows) {
        const course = new CourseModel(row)
        debug('Available course: %O', course)

        for (let lessonId of course.lessonsIds) {
          const lesson = await CourseLessonModel.fetchLessonById(lessonId)

          if (!lesson) {
            debug('Error: not find lesson (ID=%s).', lessonId)
            continue
          }

          course.pushLessonInCourse(lesson)
        }

        batch.push(course)
      }

      return batch
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = AvailableCoursesService
