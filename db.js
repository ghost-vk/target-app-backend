const path = require('path')
const Pool = require('pg').Pool
const debug = require('debug')('db')
require('dotenv').config({ path: path.resolve(__dirname, '/.env') })

const user = process.env.DB_USER
const database = process.env.DB_NAME
const password = process.env.DB_PASSWORD

debug('Connect to Database: %s', database)
debug('User: %s', user)
debug('Password: %s', password)

/**
 * @property {function} query
 */
const pool = new Pool({
  user,
  password,
  database,
  host: 'localhost',
  port: 5432,
})

module.exports = pool
