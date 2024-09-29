const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Create a new task
router.post('/', async (req, res) => {
  const { title, description, dueDate, category } = req.body;
  const userId = req.session.userId; // Get the user ID from the session

  try {
    const [result] = await db.execute('INSERT INTO tasks SET title = ?, description = ?, dueDate = ?, category = ?, userId = ?', [title, description, dueDate, category, userId]);
    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating task');
  }
});

// Get all tasks
router.get('/all', async (req, res) => {
  const userId = req.query.userId || req.session.userId; // Get the user ID from the query parameter or session
  const category = req.query.category; // Get the category from the query parameter

  try {
    let query = 'SELECT * FROM tasks WHERE userId = ?';
    let params = [userId];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    const [tasks] = await db.execute(query, params);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, category, userId } = req.body;
  const sessionUserId = req.session.userId; // Get the user ID from the session

  if (!userId || userId !== sessionUserId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

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

// Toggle task completion
router.put('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || req.session.userId; // Get the user ID from the query parameter or session

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

// Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || req.session.userId; // Get the user ID from the query parameter or session

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

module.exports = router;