const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "e-comm",
  password: "$adLet180391",
});

module.exports = pool.promise();
