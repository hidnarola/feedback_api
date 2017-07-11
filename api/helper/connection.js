var mysql = require('mysql')

var conn = {};

conn.connection = mysql.createConnection({
    host: '192.168.1.201',
    user: 'feedback_app',
    password: '2Vc4830WY68rm4F',
    database: 'feedback_app'
})

conn.connection.connect(function (err) {
    if (err)
        throw err
    console.log('Mysql Connected...')
})

module.exports = conn;