const TelegramBot = require('node-telegram-bot-api')
const debug = require('debug')('service:telegram-bot')
const isTelegramBot = process.env.IS_TELEGRAM_BOT === 'true'

const bot = isTelegramBot
  ? new TelegramBot(process.env.BOT_TOKEN, { polling: false })
  : {}

const plug = (chatId, message) => {
  console.log(`🔵 [FAKE] Send message with Telegram Bot to chat id: ${chatId}\nMessage: ${message}`)
}

module.exports = {
  async sendMessageWithTelegramBot(chatId, message) {
    try {
      if (!isTelegramBot) return plug(chatId, message)
      const botResponse = await bot.sendMessage(chatId, message)
      return botResponse
    } catch (err) {
      debug('Error when sending message with telegram bot.\n%O', err)
    }
  },
}
