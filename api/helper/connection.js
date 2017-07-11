var mysql = require('mysql')

var conn = {};

conn.connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'feedback_app'
})

conn.connection.connect(function (err) {
    if (err)
        throw err
    console.log('Mysql Connected...')
})

module.exports = conn;