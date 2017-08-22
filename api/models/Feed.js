var con = require('../helper/connection');
var async = require("async");
var _ = require('underscore-node');

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
                                /*  if (result_fv[0].vote_value == json.vote_value) {
                                 var result = {}
                                 result = {'vote_exist': json.id};                                   
                                 callback(result);
                                 } else {
                                 } */
                                is_update = true;
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
                                            'vote_value': json.vote_value,
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
                                            'vote_value': json.vote_value,
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
                        async.series({
                            flag_post: function (callback) {
                                con.connection.query("SELECT id FROM flag_post where feed_id =? AND user_id = ?", [json.feed_id, json.device_user_id], function (err, result_fv) {
                                    var result = {}
                                    if (err) {
                                        console.log(err);
                                        callback(null, result);
                                    } else {
                                        var is_insert = false;
                                        if (result_fv.length > 0 && result_fv[0].hasOwnProperty('id')) {
                                            var result = {}
                                            result = {'flag_post_id': result_fv[0].id};
                                            callback(null, result);
                                        } else {
                                            is_insert = true;
                                        }
                                        if (is_insert) {
                                            con.connection.query("Insert into flag_post (user_id,feed_id)  values(?,?)", [json.device_user_id, json.feed_id], function (err, rf) {
                                                var result = {}
                                                if (err) {
                                                    console.log(err);
                                                    callback(null, result);
                                                } else {
                                                    result = {
                                                        'flag_post_id': rf.insertId,
                                                    };
                                                    callback(null, result);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            feed_get: function (callback) {
                                con.connection.query("SELECT f.id,f.is_deleted FROM feeds f  WHERE f.id= ? ", [json.feed_id], function (err, result_feeds) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        var result_feeds_obj = {
                                            'is_feed_deleted': (result_feeds[0].is_deleted == '1') ? true : false
                                        };
                                        callback(null, result_feeds_obj)
                                    }
                                });
                            }
                        }, function (err, results) {
                            var flag_result = Object.assign({}, results.flag_post, results.feed_get);
                            callback(flag_result);
                        });
                    }
                } else {
                    var result = {}
                    result = {'feed_not_exist': json.feed_id};
                    callback(result);
                }
            }
        });

    },
    getPostDetails: function (json, callback) {
        console.log("getPostDetails Called.");
        con.connection.query("SELECT id FROM feeds where id = ?", [json.feed_id], function (err, result) {
            if (err) {
                console.log("error:", err);
            } else {
                if (result.length > 0 && result[0].hasOwnProperty('id')) {
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
                            con.connection.query("select COALESCE(SUM(CASE WHEN vote_value > 0 THEN 1 ELSE 0 END),0) positive_votes,COALESCE(SUM(CASE WHEN vote_value < 0 THEN 1 ELSE 0 END),0) negative_votes FROM feed_votes where feed_id= ?", [json.feed_id], function (err, result_votes) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, result_votes)
                                }
                            });

                        },
                        average_positive: function (callback) {
                            con.connection.query("select ROUND(COALESCE(AVG(CASE WHEN vote_value > 0 THEN vote_value ELSE 0 END),0),2) average_positive FROM feed_votes where feed_id= ? AND vote_value > 0", [json.feed_id], function (err, result_pos_avg_votes) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, result_pos_avg_votes)
                                }
                            });
                        },
                        average_negative: function (callback) {
                            con.connection.query("select ROUND(COALESCE(AVG(CASE WHEN vote_value < 0 THEN vote_value ELSE 0 END),0),2) average_negative FROM feed_votes where feed_id= ? AND vote_value < 0", [json.feed_id], function (err, result_neg_avg_votes) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, result_neg_avg_votes)
                                }
                            });

                        },
                        positive_location_votes: function (callback) {
                            con.connection.query("select id,vote_value,user_id,city,state,country FROM feed_votes where feed_id= ? AND vote_value > 0", [json.feed_id], function (err, result_votes) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, result_votes)
                                }
                            });
                        },
                        negative_location_votes: function (callback) {
                            con.connection.query("select id,vote_value,user_id,city,state,country FROM feed_votes where feed_id= ? AND vote_value < 0", [json.feed_id], function (err, result_votes) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, result_votes)
                                }
                            });
                        }
                    }, function (err, results) {
                        results.votes[0]["average_positive"] = results.average_positive[0].average_positive;
                        delete results.average_positive;

                        results.votes[0]["average_negative"] = results.average_negative[0].average_negative;
                        delete results.average_negative;
                        callback(results);
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
    resetFeedNotification: function (json, callback) {
        console.log("resetFeedNotification Called.");
        con.connection.query("SELECT id FROM feeds where id = ?", [json.feed_id], function (err, result) {
            if (err) {
                console.log("error:", err);
            } else {
                if (result.length > 0 && result[0].hasOwnProperty('id')) {
                    con.connection.query("UPDATE feeds set new_notification = 0 WHERE id = ? ", [json.feed_id], function (err, ru) {
                        if (err) {
                            console.log("error:", err);
                        } else {
                            result = {'feed_id': json.feed_id};
                            callback(result)
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
    getNotificationCount: function (json, callback) {
        console.log("getNotificationCount Called.");
        var sql = "SELECT id,feed_text,new_notification FROM feeds where is_deleted = 0 AND user_id = ?";
        con.connection.query(sql, [json.device_user_id], function (err, result_feeds) {
            var total_notification = 0;
            var newjson = {}
            var result = {}
            if (err) {
                console.log("error:", err);
                callback(result);
            } else {
                var result_arr = _.map(result_feeds, function (obj) {
                    total_notification += obj.new_notification;
                    var p = {
                        "id": obj.id,
                        "feed_text": obj.feed_text,                        
                        "new_notification": obj.new_notification,                      
                    };
                });
                newjson = {
                    total_notification: total_notification,
                    feeds: result_feeds
                }
                callback(newjson);
            }
        });

    },
};
module.exports = Feed;  