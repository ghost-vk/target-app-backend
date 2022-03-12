const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const AvailableCoursesService = require('./../available-courses.service')
const debug = require('debug')('test')

AvailableCoursesService.getAvailableCoursesForUserById(4).then(res => {
  debug('getAvailableCoursesForUserById:\n%O', res)
})

