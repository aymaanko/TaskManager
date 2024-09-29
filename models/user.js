const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  async save() {
    try {
      const hashedPassword = bcrypt.hashSync(this.password, 10);
      console.log('Hashed password:', hashedPassword);
      const query = 'INSERT INTO users SET ?';
      const values = { username: this.username, password: hashedPassword };
      const result = await db.query(query, values);
      console.log('Insert result:', result);
      this.id = result.insertId;
    } catch (err) {
      console.error('Error inserting user:', err);
      throw err;
    }
  }

  async comparePassword(candidatePassword) {
    try {
      console.log('Comparing password for user:', this.username);
      const [result] = await db.execute('SELECT password FROM users WHERE username = ?', [this.username]);
      console.log('Result:', result);
      if (!result[0]) {
        console.log('No user found');
        return false;
      }
      const hashedPassword = result[0].password;
      console.log('Hashed password:', hashedPassword);
      const isValidPassword =bcrypt.compareSync(candidatePassword, hashedPassword);
      console.log('Is valid password:', isValidPassword);
      return isValidPassword;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async findOne(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const [result] = await db.execute(query, [username]);
      return result[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = User;