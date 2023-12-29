const express = require('express');
const controller = require('../controllers/tradeController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const{validateId} = require('../middlewares/validator');
const {validateResult} = require('../middlewares/validator');

//router
const router = express.Router();

router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.post('/', isLoggedIn, validateResult, controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.edit);

router.put('/:id', validateId, isLoggedIn, isAuthor, validateResult, controller.update);

router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete);

// trading routes
router.get("/:id/trade", validateId, isLoggedIn, controller.createtrade);

router.get("/:id/tradepokemon", isLoggedIn, controller.tradepokemon);

router.get("/:id/managepokemon", validateId, isLoggedIn, controller.managepokemon);

router.post("/:id/watchlist", validateId, isLoggedIn, controller.addtowatchlist);

router.delete("/:id/deleteoffer", validateId, controller.deleteoffer);

router.delete("/:id/deletesaved", validateId, isLoggedIn, controller.deletesavedpokemons);

router.get("/:id/accept", validateId, isLoggedIn, controller.acceptoffer);

router.get("/:id/reject", validateId, isLoggedIn, controller.rejectoffer);

module.exports = router;