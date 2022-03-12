const path = require('path')
const Pool = require('pg').Pool
const debug = require('debug')('db')
require('dotenv').config({ path: path.resolve(__dirname, '/.env') })

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const user = isDev ? process.env.LOCAL_DB_USER : process.env.REMOTE_DB_USER
const database = isDev ? process.env.LOCAL_DB_NAME : process.env.REMOTE_DB_NAME
const password = isDev ? process.env.LOCAL_DB_PASSWORD : process.env.REMOTE_DB_PASSWORD

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
