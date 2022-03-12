const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const UserController = require('./../user.controller')
const debug = require('debug')('test')

const req = {
  body: {
    data: {
      login: 'babavos',
      password: 'greatWarrior13'
    }
  }
}

const res = {
  json: (res) => {
    debug('Calling res.json(): %O', res)
  }
}

const next = (err) => {
  debug('Calling next() with param: %O', err)
}

UserController.createUserWithLogin(req, res, next)
