const express = require("express")
const app = express()

const mysql = require('mysql2')
const pool = mysql.createPool({
    host: "sql12.freemysqlhosting.net",
    user: "sql12629011",
    password: "RzlzHmeUy8",
    database: "sql12629011"
});

// pool.connect((err) => {
//     if (err) {
//       console.error('Error connecting to MySQL:', err);
//       return;
//     }
//     console.log('Connected to MySQL database');
// });
// const query = "Select * from User"
// pool.query(query, (err, result) => {
//     console.log("Error", err);
//     console.log("Result", result);
// })


module.exports = pool;