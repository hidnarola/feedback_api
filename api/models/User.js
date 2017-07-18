var con = require('../helper/connection');
var async = require("async");

var User = {
    CreateUserProfile: function (json, callback) {
        console.log("CreateUserProfile Called.");
        con.connection.query("SELECT id FROM users where device_id = ?", [json.device_id], function (err, result) {
            if (err) {
                console.log("error:", err);
            } else {
                if (result.length > 0 && result[0].hasOwnProperty('id')) {
                    var result = {
                        'user_id': result[0]['id'],
                    };
                    callback(result);
                } else {
                    con.connection.query("Insert into users (device_id,city,state,country)  values(?,?,?,?)", [json.device_id, json.city, json.state, json.country], function (err, result_user) {
                        var result = {}
                        if (err) {
                            callback(result)
                        } else {
                            result = {
                                'user_id': result_user.insertId,
                            };
                            callback(result)
                        }
                    });
                }
            }
        });

    },
    createFeed: function (json, callback) {
        console.log("createFeed Called.");
        con.connection.query("Insert into feeds (feed_text,flag_type,user_id)  values(?,?,?)", [json.feed_text, json.flag_type, json.device_user_id], function (err, result_user) {
            var result = {}
            if (err) {
                console.log(err);
                callback(result)
            } else {
                result = {
                    'feed_id': result_user.insertId,
                };
                callback(result)
            }
        });

    },
    getAllFeeds: function (json, callback) {
        console.log("getAllFeeds Called.",json);        
        var sql = "SELECT f.id,f.feed_text,f.flag_type FROM feeds f INNER JOIN users u ON f.user_id = u.id WHERE u.city LIKE '%" + json.city + "%' AND u.state LIKE '%" + json.state + "%' AND u.country LIKE'%" + json.country + "%' AND f.is_deleted = '0' ORDER BY f.created desc";
        if (typeof json.flag_type != 'undefined' && json.flag_type != '') {
            sql = "SELECT f.id,f.feed_text,f.flag_type FROM feeds f INNER JOIN users u ON f.user_id = u.id WHERE f.flag_type = '" + json.flag_type + "' AND  u.city LIKE '%" + json.city + "%' AND u.state LIKE '%" + json.state + "%' AND u.country LIKE'%" + json.country + "%' AND f.is_deleted = '0' ORDER BY f.created desc";
        }
        console.log(sql);
        con.connection.query(sql, [], function (err, result_feeds) {
            var result = {}
            if (err) {
                console.log(err);
                callback(result)
            } else {
                callback(result_feeds)
            }
        });

    },
    getUserProfile: function (json, callback) {
        console.log("getUserProfile Called.", json);
        async.parallel({
            user: function (callback) {
                con.connection.query("SELECT id,device_id,city,state,country FROM users where id = ?", [json.device_user_id], function (err, ru) {
                    if (err) {
                        console.log("error:", err);
                    } else {
                        callback(null, ru)
                    }
                });
            },
            feeds: function (callback) {
                con.connection.query("SELECT f.id,f.feed_text,f.flag_type FROM feeds f INNER JOIN users u ON f.user_id = u.id WHERE f.user_id=? AND f.is_deleted = '0' ORDER BY f.created desc", [json.device_user_id], function (err, result_feeds) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(null, result_feeds)
                    }
                });
            }
        }, function (err, results) {
            callback(results);
        });

    },
};
module.exports = User;  