var mysql = require('mysql')

var conn = {};

function handleDisconnect() {
    var db_config = {
        host: '192.168.1.201',
        user: 'feedback_app',
        password: '2Vc4830WY68rm4F',
        database: 'feedback_app'
    };

    conn.connection = mysql.createConnection(db_config);

    conn.connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Mysql Connected...')
        }
    });

    conn.connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();
module.exports = conn;