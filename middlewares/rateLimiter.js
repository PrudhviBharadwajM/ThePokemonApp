const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    handler: function(req, res, next) {
        let err = new Error('Too many requests from this IP, please try again in an hour!');
        err.status = 429;
        return next(err);
    }
});