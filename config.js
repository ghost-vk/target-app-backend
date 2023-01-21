require('dotenv').config();

module.exports = {
  dbSchema: process.env.POSTGRES_SCHEMA || 'public',
};
