const ApiError = require('./../exceptions/api-error');
const debug = require('debug')('middleware:error');

module.exports = function (err, req, res) {
  debug('Error catch in error.middleware: %O', err.message);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  } 
  
  return res.status(500).json({ message: 'Непредвиденная ошибка' });
};
