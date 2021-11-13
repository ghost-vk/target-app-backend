require('dotenv').config()

module.exports = {
  isTelegramBot: process.env.IS_TELEGRAM_BOT === 'YES'
}