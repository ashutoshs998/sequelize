var passport = require('passport');
var controller = require('../controller/controller.js')
var express = require('express');
var router = express();

router.route('/user/register/').post(controller.register)

router.route('/user/login/').post(controller.login)

router.route('/user/get').get(passport.authenticate('bearer', { session: false }), controller.get)

router.route('/user/delete').get(passport.authenticate('bearer', { session: false }), controller.delete)

router.route('/user/list/:page/:limit').get(passport.authenticate('bearer', { session: false }), controller.list)

router.route('/user/address').post(passport.authenticate('bearer', { session: false }), controller.address)

module.exports = router;