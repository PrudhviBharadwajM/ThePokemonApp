const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {logInLimiter} = require('../middlewares/rateLimiter');
const {validateSignUp, validateLogin, validateResult} = require('../middlewares/validator');

const router = express.Router();

//GET Signup
router.get('/new', isGuest, controller.new);

//POST Signup
router.post('/', isGuest, validateSignUp, validateResult, controller.create);

//GET Login
router.get('/login', isGuest, controller.login);

//POST Login
router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, controller.authenticate);

// GET profile
router.get('/profile', isLoggedIn, controller.profile);

// GET logout
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
