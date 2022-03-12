const express = require('express')
const router = express.Router()
const multer = require('multer')
const { asyncMiddleware } = require('middleware-async')
const MulterUtil = require('../utils/MulterUtil')
const PostsController = require('./../controllers/posts.controller')
const authMiddleware = require('./../middleware/auth.middleware')
const adminAuthMiddleware = require('./../middleware/admin-auth.middleware')

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
 * Объект может содержать следующие поля:
 * posting_date - Обязательное. Дата в формате 'YYYY-MM-DD'.
 * title - Обязательное. Строка до 255 символов.
 * subtitle - Обязательное. Строка до 255 символов.
 * content - Текст произвольной длины.
 * recommended - ID рекомендуемого поста.
 * category - ID категории из таблицы категории.
 * tags - Строка до 255 символов.
 *
 * Поле image необязательно.
 * Может содержать файл со сжатым изображением для поста.
 */
router.post(
  '/',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  upload.single('image'),
  PostsController.addPost.bind(PostsController)
)

/**
 * Возвращает массив постов или ошибку
 * Может содержать query параметры в GET запросе:
 * category - ID требуемой категории из таблицы `posts_categories`, по умолчанию без категории
 * limit - ограничение по выдаче постов, по умолчанию 10,
 * fullmode - если 1, то возращает все поля из БД.
 *  Иначе возвращает краткую информацию о посте.
 */
router.get('/', PostsController.getPosts)

/**
 * Возвращает 1 пост
 * Содержит 1 обязательный query параметр:
 * id - целочисленное значение
 * Возращает оъект в случае успеха.
 * В случае отсутствия поста с таким ID возвращает ошибку 404
 */
router.get('/:id', PostsController.getPost)

/**
 * Удаляет пост с указанным ID
 * Содержит 1 обязательный query параметр:
 * id - целочисленное значение
 * Возращает оъект в случае успеха.
 * В случае отсутствия поста с таким ID возвращает ошибку 404
 */
router.delete(
  '/:id',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  PostsController.deletePost
)

/**
 * Обновляет указанное поле кроме поля изображения
 * Ожидает обязательные query параметры:
 * id - целочисленное значение
 * field - поле, которое следует изменить, может быть одно из:
 *  'posting_date', 'title', 'subtitle', 'content', 'recommended', 'category', 'tags'.
 * Ожидает новое значение (value) в теле запроса.
 */
router.put(
  '/field/:id/:field',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  PostsController.updateField
)

/**
 * Обновляет изображение указанного поста
 * Ожидает обязательный query параметр:
 *  id - целочисленное значение
 * Принимает в теле запроса form-data
 * в поле image должно быть изображение
 */
router.put(
  '/thumbnail/:id',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  upload.single('image'),
  PostsController.updateThumbnail
)

module.exports = router
