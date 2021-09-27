const { unlink } = require('fs')
/**
 * Метод удаляет загруженный файл
 * @param file
 */
const removeUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
    }
    unlink(file.path, (err) => {
      if (err) {
        resolve('❌ Не удалось удалить файл\n')
      } else {
        resolve('✅ Загруженный файл удален при не успешном добавлении записи в БД\n')
      }
    })
  })
}

module.exports = removeUploadedFile