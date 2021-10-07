module.exports = function (hostname, app) {
  return (req, res, next) => {
    const host = req.headers.host.split(':')[0]
    if (host === hostname) {
      return app(req, res, next)
    } else {
      next()
    }
  }
}
