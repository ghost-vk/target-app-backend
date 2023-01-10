const express = require('express');
const router = express.Router();
const PostsController = require('./../controllers/posts.controller');

/**
 * Возвращает массив постов или ошибку
 * Может содержать query параметры в GET запросе:
 * category - ID требуемой категории из таблицы `posts_categories`, по умолчанию без категории
 * limit - ограничение по выдаче постов, по умолчанию 10,
 * fullmode - если 1, то возращает все поля из БД.
 *  Иначе возвращает краткую информацию о посте.
 */
router.get('/', PostsController.getPosts);

/**
 * Возвращает 1 пост
 * Содержит 1 обязательный query параметр:
 * id - целочисленное значение
 * Возращает оъект в случае успеха.
 * В случае отсутствия поста с таким ID возвращает ошибку 404
 */
router.get('/:id', PostsController.getPost);

module.exports = router;
