const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@ymAnel123',
  database: 'taskapp',
});

async function getTasks() {
  const [rows] = await db.execute('SELECT * FROM tasks');
  return rows;
}

module.exports = { db, getTasks };