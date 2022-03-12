const db = require('./../db')
const AvailableCourseModel = require('./../models/available-course.model')
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
      if (!Number(userId) > 0) {
        return false
      }

      const dbResponse = await db.query('SELECT * FROM available_courses WHERE user_id=$1', [userId])

      if (dbResponse.rows.length === 0) {
        return false
      }

      const now = Date.now()

      const batch = []

      let row
      for (row of dbResponse.rows) {
        const availableCourse = new AvailableCourseModel(row)

        if (availableCourse.accessToDate < now) {
          continue
        }

        debug('Available course: %O', availableCourse)
        const course = await CourseModel.fetchCourseById(availableCourse.courseId)

        course.setAccessToDate({
          string: availableCourse.accessToString,
          date: availableCourse.accessToDate,
        })

        if (course.lessonsIds.length === 0) {
          debug('No lesson in Course %s', course.name)
        }

        let lessonId
        for (lessonId of course.lessonsIds) {
          const lesson = await CourseLessonModel.fetchLessonById(lessonId)

          if (!lesson) {
            debug('No find lesson while push')
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
