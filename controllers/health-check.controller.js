const to = require('await-to-js').default
const db = require('../db')
const ApiError = require('../exceptions/api-error')

class HealthCheckController {
  async isApiHealthy(req, res, next) {
    let err, dbRes
    ;[err, dbRes] = await to(db.query('SELECT * FROM healthcheck'))

    if (err) {
      return next(
        new ApiError(500, 'Error when connect to database. Try to read value.')
      )
    }

    ;[err, dbRes] = await to(
      db.query('INSERT INTO healthcheck(value) VALUES(1) RETURNING *')
    )

    if (err) {
      return next(
        new ApiError(
          500,
          'Error when connect to database. Try to insert value.'
        )
      )
    }

    ;[err] = await to(
      db.query('DELETE FROM healthcheck WHERE id=$1', [dbRes.rows[0].id])
    )

    if (err) {
      return next(
        new ApiError(
          500,
          'Error when connect to database. Try to delete value.'
        )
      )
    }

    res.status(204).send()
  }
}

module.exports = new HealthCheckController()
