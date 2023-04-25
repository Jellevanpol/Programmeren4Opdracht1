// get the client
const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'shareameal',
    waitForConnections: true,
    port: 3306,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});

// simple query
pool.getConnection(function (err, conn) {
    // Do something with the connection
    if (err) {
        console.log('error')
    }
    if (conn) {
        conn.query(
            'SELECT `id`, `name` FROM `meal`',
            function (err, results) {
                if(err){
                    console.log('errors: ', err.sqlMessage)
                }
                console.log('results: ', results); // results contains rows returned by server
            }
        );

        pool.releaseConnection(conn)
    }
})