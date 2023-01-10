const express = require('express');
const router = express.Router();
const MagnetsController = require('./../controllers/magnets.controller');

/**
 * Возвращает массив лид-магнитов или ошибку
 */
router.get('/', MagnetsController.getMagnets);

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
router.get('/:id', MagnetsController.getMagnet);

module.exports = router;
