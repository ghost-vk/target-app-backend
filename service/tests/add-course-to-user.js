const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const debug = require('debug')('test')
const UserService = require('./../user.service')

UserService.addCoursesToUser(6, { id: 1, accessTo: '2022-04-01' }).then((res) => {
  debug('addCoursesToUser response: %O', res)
})
