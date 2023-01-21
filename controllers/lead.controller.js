const { isValidPhoneNumber, isSupportedCountry, parsePhoneNumber } = require('libphonenumber-js');
const debug = require('debug')('controller:lid');

const db = require('./../db');
const { dbSchema } = require('./../config');
const { leadSchema } = require('./../utils/validation-schemes');
const { sendMessageWithTelegramBot } = require('./../service/telegram-bot.service');

/**
 * Controller of '/api/lid'
 */
class LeadController {
  /**
   * Method creates lid and save to database
   * @param {string|undefined}  name - The name of lid. Should be min length 2.
   * @param {string} phone - The valid phone number of lid.
   * @param {string} countryCode - Two-letter ISO country code (like 'RU').
   * @param {string|undefined} email - The email address of lid.
   * @param {string|undefined} source - The source where are from lid. Min length 5.
   * @param {boolean|undefined} shouldCallback - Flag shows necessary of call back to lid.
   * @returns {object} Returns empty body with status 204 if success and object with errors if not: { status: 'error', errors: { name: '...', phone: '...', countryCode: '', email: '...', source: '...'  } }
   */
  async createLead(req, res) {
    const errors = {
      name: '',
      phone: '',
      countryCode: '',
      email: '',
      source: '',
      contactType: '',
    };

    try {
      const leadData = {
        name: req.body.name,
        phone: req.body.phone,
        countryCode: req.body.countryCode,
        email: req.body.email,
        source: req.body.source,
        shouldCallback: req.body.shouldCallback,
        contactType: req.body.contactType,
      };

      await leadSchema.validate(leadData, { abortEarly: false });

      if (!isSupportedCountry(leadData.countryCode)) {
        errors.phone = 'Не поддерживаемый код страны';
        res.status(405).json({ status: 'error', errors });
      }

      if (!isValidPhoneNumber(leadData.phone, leadData.countryCode)) {
        errors.phone = 'Не действительный номер телефона';
        res.status(405).json({ status: 'error', errors });
      }

      const parsedPhone = parsePhoneNumber(
        leadData.phone,
        leadData.countryCode,
      ).formatInternational();

      const insertQuery = `INSERT INTO ${dbSchema}.lids(name, phone, email, source, country_code) 
                           VALUES ($1, $2, $3, $4, $5) 
                           RETURNING *`;

      const newLeadDbResponse = await db.query(insertQuery, [
        leadData.name,
        parsedPhone,
        leadData.email,
        leadData.source,
        leadData.countryCode,
      ]);
      if (newLeadDbResponse.rows[0]?.phone?.length > 0) {
        res.status(204).json({});
      } else {
        res.status(500).json({ status: 'error' });
      }

      if (leadData.shouldCallback) {
        await this.notificateAboutLid({ ...leadData, phone: parsedPhone });
      }
    } catch (err) {
      debug('Error in lead controller (createLead): %O', err);
      err?.inner?.forEach((error) => {
        errors[error.path] = errors[error.path] || error.message;
      });
      res.status(500).json({ status: 'error', errors });
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async notificateAboutLid(data) {
    try {
      const message =
        `${data.name} запрашивает обратную связь через ${data.contactType}\n` +
        `Номер телефона: ${data.phone}\nИсточник: ${data.source}`;
      await sendMessageWithTelegramBot(process.env.CHAT_ID, message);
    } catch (err) {
      debug('Error in lead controller (notificateAboutLid): %O', err);
    }
  }
}

module.exports = new LeadController();
