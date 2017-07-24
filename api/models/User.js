var con = require('../helper/connection');
var async = require("async");
var _ = require('underscore-node');

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
        console.log("getAllFeeds Called.");
        var limit = 100;
        if (typeof json.limit != 'undefined' && json.limit != '') {
            limit = json.limit;
        }

        var sql = "SELECT f.id,f.feed_text,DATE_FORMAT(f.created,'%Y-%m-%e %H:%i:%s') as feed_created,f.flag_type,fv.id as feed_vote_id,fv.user_id, fv.vote_value ,fv.city,fv.state,fv.country,DATE_FORMAT(fv.created,'%Y-%m-%e %H:%i:%s') as created"
        sql += " FROM feeds f INNER JOIN users u ON f.user_id = u.id";
        sql += " LEFT JOIN feed_votes fv ON fv.feed_id = f.id AND fv.user_id= " + json.device_user_id;
        sql += " WHERE ";

        if (typeof json.flag_type != 'undefined' && json.flag_type != '') {
            sql += " f.flag_type = '" + json.flag_type + "' AND ";
        }

        if (typeof json.last_request_time != 'undefined' && json.last_request_time != '') {
            sql += " f.created >= '" + json.last_request_time + "' AND ";           
        }

        if (typeof json.id != 'undefined' && json.id != '') {
            sql += " f.id < '" + json.id + "' AND ";           
        }
        
        sql += " u.city LIKE '%" + json.city + "%' AND u.state LIKE '%" + json.state + "%' AND u.country LIKE '%" + json.country + "%' AND f.is_deleted = '0'";
        
        sql += " ORDER BY f.created DESC,f.id DESC";

        sql += " LIMIT "+limit;		
        con.connection.query(sql, [], function (err, result_feeds) {
            var result = {}
            if (err) {
                console.log(err);
                callback(result)
            } else {
                var result_arr = _.map(result_feeds, function (obj) {

                    var json = {
                        "id": obj.id,
                        "feed_text": obj.feed_text,
                        "flag_type": obj.flag_type,
                        "created": obj.feed_created,
                    };
                    json['user_vote'] = {}
                    if (obj.feed_vote_id) {
                        json['user_vote'] = {"feed_vote_id": obj.feed_vote_id,
                            "user_id": obj.user_id,
                            "vote_value": obj.vote_value,
                            "city": obj.city,
                            "state": obj.state,
                            "country": obj.country,
                            "created": obj.created,
                        };
                    }
                    return json;
                })
                callback(result_arr)
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