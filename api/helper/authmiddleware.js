var express = require('express');
var apiRoutes = express.Router();
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
var middeleware = {};

middeleware.auth = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                if (typeof decoded.device_user_id !== "undefined") {
                    req.body.device_user_id = decoded.device_user_id;                   
                    next();
                } else {
                    return res.status(403).send({
                        success: false,
                        message: 'Invalid token.'
                    });
                }

            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

module.exports = middeleware;