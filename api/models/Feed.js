var con = require('../helper/connection');
var async = require("async");

var Feed = {
    giveVote: function (json, callback) {
        console.log("giveVote Called.");
        con.connection.query("SELECT id FROM feeds where id = ?", [json.feed_id], function (err, result) {
            if (err) {
                console.log("error:", err);
            } else {
                if (result.length > 0 && result[0].hasOwnProperty('id')) {
                    con.connection.query("SELECT id,vote_value FROM feed_votes where feed_id =? AND user_id = ?", [json.feed_id, json.device_user_id], function (err, result_fv) {
                        var result = {}
                        if (err) {
                            console.log(err);
                            callback(result)
                        } else {
                            var is_update = false;
                            var is_insert = false;
                            if (result_fv.length > 0 && result_fv[0].hasOwnProperty('id')) {
                                if (result_fv[0].vote_value == json.vote_value) {
                                    var result = {}
                                    result = {'vote_exist': json.id};
                                    console.log(result);
                                    callback(result);
                                } else {
                                    is_update = true;
                                }
                            } else {
                                is_insert = true;
                            }
                            if (is_update) {
                                con.connection.query("UPDATE feed_votes SET vote_value='?' WHERE id=?", [json.vote_value, result_fv[0].id], function (err, result_feed) {
                                    var result = {}
                                    if (err) {
                                        console.log(err);
                                        callback(result)
                                    } else {
                                        result = {
                                            'feed_vote_id': result_fv[0].id,
                                        };
                                        callback(result)
                                    }
                                });
                            }
                            if (is_insert) {
                                con.connection.query("Insert into feed_votes (feed_id,vote_value,user_id,city,state,country)  values(?,?,?,?,?,?)", [json.feed_id, json.vote_value, json.device_user_id, json.city, json.state, json.country], function (err, result_feed) {
                                    var result = {}
                                    if (err) {
                                        console.log(err);
                                        callback(result)
                                    } else {
                                        result = {
                                            'feed_vote_id': result_feed.insertId,
                                        };
                                        callback(result)
                                    }
                                });
                            }
                        }
                    });
                } else {
                    var result = {}
                    result = {'feed_not_exist': json.feed_id};
                    console.log(result);
                    callback(result);
                }
            }
        });

    },
    flagPost: function (json, callback) {
        console.log(json);
        console.log("flagPost Called.");
        con.connection.query("SELECT id,is_deleted FROM feeds where id = ?", [json.feed_id], function (err, result) {
            if (err) {
                console.log("error:", err);
            } else {
                if (result.length > 0 && result[0].hasOwnProperty('id')) {
                    if (result[0].is_deleted == "1") {
                        var result = {}
                        result = {'feed_deleted': json.id};                        
                        callback(result);
                    } else {
                        con.connection.query("SELECT id FROM flag_post where feed_id =? AND user_id = ?", [json.feed_id, json.device_user_id], function (err, result_fv) {
                            var result = {}
                            if (err) {
                                console.log(err);
                                callback(result)
                            } else {
                                var is_insert = false;
                                if (result_fv.length > 0 && result_fv[0].hasOwnProperty('id')) {
                                    var result = {}
                                    result = {'flagged': json.id};
                                    console.log(result);
                                    callback(result);
                                } else {
                                    is_insert = true;
                                }
                                if (is_insert) {
                                    con.connection.query("Insert into flag_post (user_id,feed_id)  values(?,?)", [json.device_user_id, json.feed_id], function (err, rf) {
                                        var result = {}
                                        if (err) {
                                            console.log(err);
                                            callback(result)
                                        } else {
                                            result = {
                                                'flag_post_id': rf.insertId,
                                            };
                                            callback(result)
                                        }
                                    });
                                }
                            }
                        });
                    }
                } else {
                    var result = {}
                    result = {'feed_not_exist': json.feed_id};
                    console.log(result);
                    callback(result);
                }
            }
        });

    },
};
module.exports = Feed;  