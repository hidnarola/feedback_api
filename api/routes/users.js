var express = require('express');
var expressValidator = require('express-validator');
var router = express.Router();
var con = require('../helper/connection');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var config = require('../config');

router.post('/createFeed', function (req, res, next) {
    var schema = {
        'flag_type': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'flag_type is required'
        },
        'feed_text': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'feed_text is required'
        },
    };
    req.check(schema);
    var errors = req.validationErrors();
    if (errors) {
        var result = {
            status: false,
            error: errors
        };
        res.json(result);
    } else {
        User.createFeed(req.body, function (result) {
            if (Object.keys(result).length > 0) {
                res.status(200).json({
                    status: true,
                    data: result
                });
            } else {
                res.status(422).json({
                    status: false,
                    message: 'Feed could not created.',
                });
            }
        })
    }
});

router.post('/getAllFeeds', function (req, res, next) {
    var schema = {
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
    var errors = req.validationErrors();
    if (errors) {
        var result = {
            status: false,
            error: errors
        };
        res.json(result);
    } else {
        User.getAllFeeds(req.body, function (result) {
            res.status(200).json({
                status: true,
                data: result
            });
        })
    }
});

router.get(['/getUserProfile', '/getUserProfile/:user_id'], function (req, res, next) {    
    var json = {};
    if (typeof req.params.user_id !== "undefined") {
        json.device_user_id = req.params.user_id;
    } else {
        json.device_user_id = req.body.device_user_id;
    }    
    User.getUserProfile(json, function (result) {
        res.status(200).json({
            status: true,
            data: result
        });
    })

});

module.exports = router;
