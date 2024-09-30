const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function getTasks() {
  const [rows] = await db.execute('SELECT * FROM tasks');
  return rows;
}

module.exports = { db, getTasks };