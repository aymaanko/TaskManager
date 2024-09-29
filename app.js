const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

app.use(session({
  secret: '@ymAnel123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const User = require('./models/user');

app.use(bodyParser.json());
app.use(cors());

// Serve registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    res.status(400).json({ error: 'Username must contain only letters and numbers' });
    return;
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users SET username = ?, password = ?', [username, hashedPassword]);
    res.json({ message: 'Registration successful!!', redirect: '/' }); // Return a JSON response with a redirect URL
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error registering user: ' + err.message });
  }
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Username and password are required' });
    return;
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    } else {
      const isValidPassword = await bcrypt.compare(password, rows[0].password);
      if (isValidPassword) {
        req.session.userId = rows[0].id; // Set the user ID in the session
        res.json({ success: true, message: 'Login successful!!', userId: rows[0].id });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    res.status(400).json({ success: false, message: 'Error logging in: ' + error.message });
  }
});

const { db, getTasks } = require('./db');

// Get tasks endpoint
app.get('/api/tasks', async (req, res) => {
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [tasks] = await db.execute('SELECT * FROM tasks WHERE userId = ?', [userId]);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Create task endpoint
app.post('/api/tasks', async (req, res) => {
  const { title, description, dueDate, category } = req.body;
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE title = ? AND description = ? AND dueDate = ? AND category = ? AND userId = ?', [title, description, dueDate, category, userId]);
    if (rows.length > 0) {
      res.status(400).json({ error: 'Task already exists' });
    } else {
      const [result] = await db.execute('INSERT INTO tasks SET title = ?, description = ?, dueDate = ?, category = ?, userId = ?', [title, description, dueDate, category, userId]);
      const taskId = result.insertId;
      res.json({ message: 'Task created successfully ',taskId });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating task');
  }
});
// Toggle task endpoint
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      const task = rows[0];
      task.completed = !task.completed;
      await db.execute('UPDATE tasks SET completed = ? WHERE id = ?', [task.completed, id]);
      res.json({ message: 'Task toggled successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error toggling task' });
  }
});

// Update task endpoint
app.put('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, dueDate, category } = req.body;
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      await db.execute('UPDATE tasks SET title = ?, description = ?, dueDate = ?, category = ? WHERE id = ?', [title, description, dueDate, category, id]);
      res.json({ message: 'Task updated successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete task endpoint
app.delete('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ message: 'Task deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Static files
app.use(express.static('public'));

// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
app.post('/api/logout', (req, res) => {
  console.log('Received logout request');
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).send('Error logging out');
    } else {
      console.log('Logged out successfully');
      res.send('Logged out successfully');
    }
  });
});