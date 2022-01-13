const TelegramBot = require('node-telegram-bot-api')
const { isTelegramBot } = require('./config.service')
const bot = isTelegramBot ? new TelegramBot(process.env.BOT_TOKEN, { polling: false }) : {}

const plug = async (chatId, message) => {
  console.log(`🔵 [FAKE] Send message with Telegram Bot to chat id: ${chatId}\nMessage: ${message}`)
  return true
}

module.exports = {
  async sendMessageWithTelegramBot(chatId, message) {
    try {
      return isTelegramBot ? await bot.sendMessage(chatId, message) : await plug(chatId, message)
    } catch (e) {
      console.warn('Error when sending message with telegram bot.\n', e)
    }
  },
}
