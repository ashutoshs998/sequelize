var express = require('express');
var router = express();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var validation = require('./validation');
var passport = require('passport');
var model = require('../db');
router.post('/user/register/', function(req, res, next) {
    validation.register_validation(req.body, function(err, data) {
        if (err) {
            next(err)
        } else {
            var detail = new model.user_data({
                username: data.username,
                email: data.email,
                password: data.password,
                firstname: data.firstname,
                lastname: data.lastname
            })
            detail.save().then((data, err) => {
                if (err) {
                    next(err)
                } else {
                    res.json({ error: 0, message: "data inserted", data: data })
                }
            });
        }
    })
});
router.post('/user/login/', function(req, res, next) {
    validation.login_validation(req.body, function(err, data) {
        if (err) {
            next(err)
        } else {
            model.user_data.find({ where: { username: data.username, password: data.password } }).then((users_data, err) => {
                if (err) {
                    next(err);
                } else if (users_data) {
                    var token = jwt.sign({ user_id: users_data.id }, "jwt_tok", {
                        expiresIn: 3600000
                    });
                    res.json({ error: 0, message: "token generated", token: token })
                } else {
                    res.json('Not a user!Get registered')
                }
            });
        }
    });
});
router.get('/user/get/', passport.authenticate('bearer', { session: false }), function(req, res, next) {
    model.user_data.find({ where: { id: req.user.id }, include: [model.address] }).then((complete_data, err) => {
        if (err) {
            next(err);
        } else if (complete_data) {
            res.json({ error: 0, message: "complete data found", user_detail: complete_data })
        } else {
            res.json("can't fetch data");
        }
    });
});
router.get('/user/delete', passport.authenticate('bearer', { session: false }), function(req, res, next) {
    model.user_data.destroy({ where: { id: req.user.id } }).then((result, err) => {
        if (err) {
            next(err)
        } else {
            res.json({ error: 0, message: "data deleted", data: result });
        }
    });
});
router.get('/user/list/:page/:limit', passport.authenticate('bearer', { session: false }), function(req, res, next) {
    req.params.limit = parseInt(req.params.limit);
    model.user_data.findAll({ offset: ((req.params.page) * (req.params.limit)), limit: (req.params.limit) }).then((data, err) => {
        if (err) {
            next(err)
        } else {
            res.json({ error: 0, message: "list found", list: data });
        }
    });
});
router.post('/user/address', passport.authenticate('bearer', { session: false }), function(req, res, next) {
    validation.validateAddress(req.body, function(err, data) {
        if (err) {
            next(err);
        } else if (data) {
            model.address.find({ where: { user_id: data.user_id } }).then((address_data, err) => {
                if (err) {
                    next(err);
                } else if (address_data) {
                    address_data.updateAttributes({
                            address: data.address,
                            phone_no: data.phone_no
                        })
                        .then((address_data, err) => {
                            if (err) {
                                next(err);
                            } else {
                                res.json({ error: 0, message: "data updated", data: address_data });
                            }
                        })
                } else {
                    if (!address_data) {
                        var user_Address = new model.address({
                            user_id: data.user_id,
                            address: data.address,
                            phone_no: data.phone_no
                        });
                        user_Address.save().then((data, err) => {
                            if (err) {
                                next(err)
                            } else {
                                res.json({ error: 0, message: "data inserted", address: data })
                            }
                        });
                    } else {
                        res.json(address_data)
                    }
                }
            });
        } else {
            res.json("Incorrect Access Token");
        }
    });
});
module.exports = router;