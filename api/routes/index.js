var express = require('express');
var expressValidator = require('express-validator');
var router = express.Router();
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var config = require('../config');

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Feedback API'});
});

router.post('/CreateUserProfile', function (req, res, next) {
    var schema = {
        'device_id': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'device_id is required'
        },
        'city': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'city is required'
        },
        'state': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'state is required'
        },
        'country': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'country is required'
        },
    };
    req.check(schema);
    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var v_result = {
                status: false,
                error: result.array()
            };
            res.json(v_result);
        } else {
            User.CreateUserProfile(req.body, function (result) {
                if (Object.keys(result).length > 0) {
                    var userinfo = {device_user_id: result.user_id};
                    var token = jwt.sign(userinfo, config.secret, {
                        //expiresIn: 1440 // expires in 24 hours
                    });
                    result.access_token = token;
                    res.status(200).json({
                        status: true,
                        data: result
                    });
                } else {
                    res.status(422).json({
                        status: false,
                        message: 'User profile not created.',
                    });
                }
            })
        }
    });
});

module.exports = router;
