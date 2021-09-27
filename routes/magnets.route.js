const express = require('express')
const router = express.Router()
const MagnetsController = require('./../controllers/magnets.controller')
const MulterUtil = require('../utils/MulterUtil')
const multer = require('multer')
const { route } = require('express/lib/router')

const upload = multer({
  storage: MulterUtil.uploadStorage(),
  fileFilter: MulterUtil.existFileFilter(),
})

/**
 * Запрос принимает form-data
 * Может содержать два поля: image, values (*)
 * В обязательном поле values должен содержаться объект,
 * упакованный методом JSON.stringify()
 *
 * Объект values может содержать следующие поля:
 * name - Название лид магнита. Обязательное. Строка до 255 символов.
 * link - Ссылка для получения лид магнита. Обязательное. Строка до 255 символов.
 * description - Текст произвольной длины.
 *
 * Поле image необязательно,
 * может содержать файл со сжатым изображением для лид магнита.
 */
router.post(
  '/',
  upload.single('image'),
  MagnetsController.add.bind(MagnetsController)
)

/**
 * Обновляет указанное поле кроме поля изображения
 * Ожидает обязательные query параметры:
 * id - целочисленное значение
 * field - поле, которое следует изменить, может быть одно из:
 *  'name', 'link', 'description'.
 * Ожидает новое значение (value) в теле запроса.
 */
router.put('/field/:id/:field', MagnetsController.updateField)

/**
 * Обновляет изображение указанного поста
 * Ожидает обязательный query параметр:
 *  id - целочисленное значение
 * Принимает в теле запроса form-data
 * в поле image должно быть изображение
 */
router.put(
  '/image/:id',
  upload.single('image'),
  MagnetsController.updateThumbnail
)

/**
 * Возвращает массив лид-магнитов или ошибку
 */
router.get('/', MagnetsController.getMagnets)

/**
 * Возвращает 1 лид магнит
 *
 * Содержит 2 query параметра:
 *  id - целочисленное значение
 *   Возращает оъект в случае успеха.
 *   В случае отсутствия лид-магнита с таким ID возвращает ошибку 404;
 *  link
 *   Если данный параметр равен 1, то вернет только ссылку
 */
router.get('/:id', MagnetsController.getMagnet)

/**
 * Удаляет лид-магнит с указанным ID
 * Содержит 1 обязательный query параметр:
 * id - целочисленное значение
 * Возращает оъект в случае успеха.
 * В случае отсутствия лид-магнита с таким ID возвращает ошибку 404
 */
router.delete('/:id', MagnetsController.delete)



module.exports = router
