const yup = require('yup');

const errorMessages = {
  required: (err) => `Поле ${err.path} обязательно для заполнения`,
  phone: 'Номер телефона не действителен',
  checkPrivacy: 'Требуется согласия на обработку пользовательских данных',
  shouldNumber: 'Требуется числовое значение',
  shouldInt: 'Требуется целочисленное значение',
  shouldPositive: 'Требуется значение больше нуля',
  wrongDataType: 'Не верный формат данных',
  shouldEmail: 'Не правильный формат email адреса',
  minLengthString: (e) => `Минимум ${e.min} символов`,
  maxLengthString: (e) => `Максимум ${e.max} символов`,
};

const leadSchema = yup.object({
  name: yup.string().min(2, errorMessages.minLengthString).max(50, errorMessages.maxLengthString),
  phone: yup.string().required(errorMessages.required),
  email: yup.string().email(errorMessages.shouldEmail),
  source: yup
    .string()
    .min(5, errorMessages.minLengthString)
    .max(100, errorMessages.maxLengthString),
  contactType: yup.string().max(50, errorMessages.maxLengthString),
});

module.exports = { leadSchema };
