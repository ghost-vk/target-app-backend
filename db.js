const Pool = require('pg').Pool
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const pool = new Pool({
  user: isDev ? process.env.LOCAL_DB_USER : process.env.REMOTE_DB_USER,
  password: isDev ? process.env.LOCAL_DB_PASSWORD : process.env.REMOTE_DB_PASSWORD,
  host: 'localhost',
  port: 5432,
  database: isDev ? process.env.LOCAL_DB_NAME : process.env.REMOTE_DB_NAME
})

module.exports = pool