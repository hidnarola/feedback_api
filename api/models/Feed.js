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
    getPostDetails: function (json, callback) {
        console.log("getPostDetails Called.");
        async.parallel({
            feed: function (callback) {
                con.connection.query("SELECT f.id,f.feed_text,f.flag_type,DATE_FORMAT(f.created,'%Y-%m-%e %H:%i:%s') as created,u.city,u.state,u.country FROM feeds f INNER JOIN users u ON f.user_id = u.id WHERE f.id=? AND f.is_deleted = '0' ORDER BY f.created desc", [json.feed_id], function (err, ru) {
                    if (err) {
                        console.log("error:", err);
                    } else {
                        callback(null, ru)
                    }
                });
            },
            votes: function (callback) {
                con.connection.query("select COALESCE(SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END),0) positive_votes,COALESCE(SUM(CASE WHEN vote_value =0 THEN 1 ELSE 0 END),0) negative_votes,COALESCE(AVG(CASE WHEN vote_value =1 THEN 1 ELSE 0 END),0) average_positive,COALESCE(AVG(CASE WHEN vote_value =0 THEN 1 ELSE 0 END),0) average_negative FROM feed_votes where feed_id= ?", [json.feed_id], function (err, result_votes) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(null, result_votes)
                    }
                });
            },
            positive_location_votes: function (callback) {
                con.connection.query("select id,feed_id,vote_value,user_id,city,state,country,DATE_FORMAT(created,'%Y-%m-%e %H:%i:%s') as created FROM feed_votes where feed_id= ? AND vote_value = 1 group by city,state,country", [json.feed_id], function (err, result_votes) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(null, result_votes)
                    }
                });
            },
            negative_location_votes: function (callback) {
                con.connection.query("select id,feed_id,vote_value,user_id,city,state,country,DATE_FORMAT(created,'%Y-%m-%e %H:%i:%s') as created FROM feed_votes where feed_id= ? AND vote_value = 0 group by city,state,country", [json.feed_id], function (err, result_votes) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(null, result_votes)
                    }
                });
            }
        }, function (err, results) {
            callback(results);
        });
    },
};
module.exports = Feed;  