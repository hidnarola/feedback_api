var mysql = require('mysql')

var conn = {};

function handleDisconnect() {
    var db_config = {
        host: 'localhost',
        user: 'root',
        password: 'Trb3KwXYWs3XJ',
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