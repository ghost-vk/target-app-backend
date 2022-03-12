const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })

const UserService = require('./../user.service')

UserService.getUserByLogin('ghost1').then((res) => {
  console.log(res)
})
