var express = require('express');
var expressValidator = require('express-validator');
var router = express.Router();
var con = require('../helper/connection');
var User = require('../models/User');
var Feed = require('../models/Feed');
var jwt = require('jsonwebtoken');
var config = require('../config');

router.post('/giveVote', function (req, res, next) {
    var schema = {
        'feed_id': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'feed_id is required'
        },
        'vote_value': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'vote_value is required'
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
            Feed.giveVote(req.body, function (result) {
                if (Object.keys(result).length > 0 && result.hasOwnProperty('feed_vote_id')) {
                    res.status(200).json({
                        status: true,
                        data: result
                    });
                } else if (Object.keys(result).length > 0 && result.hasOwnProperty('feed_not_exist')) {
                    res.status(422).json({
                        status: false,
                        message: 'Feed not exist.',
                    });
                } else if (Object.keys(result).length > 0 && result.hasOwnProperty('vote_exist')) {
                    res.status(422).json({
                        status: false,
                        message: 'Feed vote already given.',
                    });
                } else {
                    res.status(422).json({
                        status: false,
                        message: 'Something went wrong. Please try again.',
                    });
                }
            })
        }
    });
});
router.post('/flagPost', function (req, res, next) {
    var schema = {
        'feed_id': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'feed_id is required'
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
            Feed.flagPost(req.body, function (result) {
                if (Object.keys(result).length > 0 && result.hasOwnProperty('flag_post_id')) {
                    res.status(200).json({
                        status: true,
                        data: result
                    });
                } else if (Object.keys(result).length > 0 && result.hasOwnProperty('feed_deleted')) {
                    res.status(422).json({
                        status: false,
                        message: 'Feed is already deleted.',
                    });
                } else if (Object.keys(result).length > 0 && result.hasOwnProperty('flagged')) {
                    res.status(422).json({
                        status: false,
                        message: 'Feed is already flagged.',
                    });
                } else {
                    res.status(422).json({
                        status: false,
                        message: 'Something went wrong. Please try again.',
                    });
                }
            })
        }
    });
});
router.post('/getPostDetails', function (req, res, next) {
    var schema = {
        'feed_id': {
            in: 'body',
            notEmpty: true,
            errorMessage: 'feed_id is required'
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
            Feed.getPostDetails(req.body, function (result) {
                console.log('result', result);
                if (Object.keys(result).length > 0 && result.hasOwnProperty('feed')) {
                    res.status(200).json({
                        status: true,
                        data: result
                    });
                } else if (Object.keys(result).length > 0 && result.hasOwnProperty('feed_not_exist')) {
                    res.status(422).json({
                        status: false,
                        message: 'Feed not exist.',
                    });
                } else {
                    res.status(422).json({
                        status: false,
                        message: 'Something went wrong. Please try again.',
                    });
                }
            })
        }
    });

});
module.exports = router;