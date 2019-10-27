const express = require('express');
const controller = require('./controller');

const router = express.Router();


router.get('/games', controller.gameIndex);

router.get('/games/:id', controller.gameShow);

router.post('/games/:id/add-army', controller.addArmy);

router.post('/games/:id/start', controller.startGame);

router.post('/games/:id/reset', controller.resetGame);

module.exports = router;
