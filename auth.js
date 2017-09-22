var db = require('./db.js');
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var jwt = require('jsonwebtoken');
passport.use(new Strategy(function(token, cb) {
    jwt.verify(token, "jwt_tok", function(err, access_token_data) {
        if (err) {
            return cb(err, null);
        } else {
            db.user_data.find({ where: { id: access_token_data.user_id } }).then(function(user_data, err) {
                if (err) {
                    return cb(err, null);
                } else if (!user_data) {
                    return cb(null, false);
                } else {
                    return cb(null, user_data);
                }
            });
        }
    });
}));