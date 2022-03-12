const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const debug = require('debug')('test')
const CourseModel = require('./../course.model')

CourseModel.fetchCourseById(1).then(res => {
  debug('Got response from fetchCourseById:\n%O', res)
})
