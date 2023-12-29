const model = require('../models/user');
const Trade = require('../models/trade');
const wishlistModel = require('../models/wishlist');
const offerModel = require('../models/offer');

// Sign up
exports.new = (req, res) => {
    res.render('../views/user/new');
};

exports.create = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(() => res.redirect('/users/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }
            if (err.code === 11000) {
                req.flash('error', 'Email already exists');
                return res.redirect('/users/new');
            }
            next(err);
        });
};

//login
exports.login = (req, res) => {
    res.render('../views/user/login');
};

exports.authenticate = (req, res, next) => {
    //authenticate user's login request
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            req.flash('success', 'You have successfully logged in');
                            res.redirect('/users/profile');
                        } else {
                            req.flash('error', 'wrong password');
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

// user profile
exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([
                model.findById(id),
                Trade.find({ author:id }),
                Trade.find({watchlist: true}),
                wishlistModel.find({ savedBy: id }),
                Trade.find({ offered: true}),
                offerModel.find({ offeredBy: id })
            ])
        .then(results => {
            const [user, trades, savedPokemon, savedByUser, offered, offeredByUser ] = results;
            res.render('./user/profile', { user, trades, savedPokemon, savedByUser, offered, offeredByUser });
        })
        .catch(err => next(err));
};

// logout
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        else res.redirect('/');
    });
};