const db = require('./../db')
const { lidSchema } = require('./../utils/validation-schemes')
require('dotenv').config()
const {
  isValidPhoneNumber,
  isSupportedCountry,
  parsePhoneNumber,
} = require('libphonenumber-js')
const { sendMessageWithTelegramBot } = require('./../service/telegram-bot.service')


/**
 * Controller of '/api/lid'
 * @class
 */
class LidController {
  /**
   * Method access by POST method
   * Method creates lid and save to database
   * @param {string|undefined}  name - The name of lid. Should be min length 2.
   * @param {string} phone - The valid phone number of lid.
   * @param {string} countryCode - Two-letter ISO country code (like 'RU').
   * @param {string|undefined} email - The email address of lid.
   * @param {string|undefined} source - The source where are from lid. Min length 5.
   * @param {boolean|undefined} shouldCallback - Flag shows necessary of call back to lid.
   * @returns {object} Returns empty body with status 204 if success and object with errors if not: { status: 'error', errors: { name: '...', phone: '...', countryCode: '', email: '...', source: '...'  } }
   */
  async createLid(req, res) {
    const data = {
      name: req.body.name,
      phone: req.body.phone,
      countryCode: req.body.countryCode,
      email: req.body.email,
      source: req.body.source,
      shouldCallback: req.body.shouldCallback,
      contactType: req.body.contactType,
    }
    const errors = {
      name: '',
      phone: '',
      countryCode: '',
      email: '',
      source: '',
      contactType: '',
    }
    try {
      await lidSchema.validate(data, { abortEarly: false })
      if (!isSupportedCountry(data.countryCode)) {
        errors.phone = 'Не поддерживаемый код страны'
        res.status(405).json({ status: 'error', errors })
      }
      if (!isValidPhoneNumber(data.phone, data.countryCode)) {
        errors.phone = 'Не действительный номер телефона'
        res.status(405).json({ status: 'error', errors })
      }
      const parsedPhone = parsePhoneNumber(
        data.phone,
        data.countryCode
      ).formatInternational()
      const newLid = await db.query(
        `INSERT INTO lids (name, phone, email, source, country_code) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.name, parsedPhone, data.email, data.source, data.countryCode]
      )
      if (newLid.rows[0]?.phone?.length > 0) {
        res.status(204).json({})
      } else {
        res.status(500).json({ status: 'error' })
      }
      if (data.shouldCallback) {
        await this.notificateAboutLid({ ...data, phone: parsedPhone })
      }
    } catch (err) {
      console.log(err)
      err?.inner?.forEach((error) => {
        errors[error.path] = errors[error.path] || error.message
      })
      res.status(500).json({ status: 'error', errors })
    }
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async notificateAboutLid(data) {
    try {
      const message = `${data.name} запрашивает обратную связь через ${data.contactType}\nНомер телефона: ${data.phone}\nИсточник: ${data.source}`
      await sendMessageWithTelegramBot(process.env.CHAT_ID, message)
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = new LidController()
